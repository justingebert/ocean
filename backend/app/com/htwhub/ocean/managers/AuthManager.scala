package com.htwhub.ocean.managers

import com.htwhub.ocean.engines.PostgreSQLEngine
import com.htwhub.ocean.managers.exceptions.ManagerException
import com.htwhub.ocean.managers.AuthManager.Exceptions
import com.htwhub.ocean.models.User
import com.htwhub.ocean.serializers.auth.AccessTokenContent
import com.htwhub.ocean.serializers.auth.AuthResponse
import com.htwhub.ocean.serializers.auth.RefreshTokenContent
import com.htwhub.ocean.serializers.auth.RefreshTokenRequest
import com.htwhub.ocean.serializers.auth.SignInRequest
import com.htwhub.ocean.service.exceptions.ServiceException
import com.htwhub.ocean.service.LdapService
import com.htwhub.ocean.service.TokenService
import com.htwhub.ocean.service.UserService
import java.time.Instant
import javax.inject.Inject
import play.api.Configuration
import play.api.Logger
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

class AuthManager @Inject() (
  configuration: Configuration,
  userService: UserService,
  ldapService: LdapService,
  postgreSQLEngine: PostgreSQLEngine,
  tokenService: TokenService,
)(implicit
  ec: ExecutionContext
) {

  val logger: Logger = Logger(this.getClass)

  val LDAP_GROUP_NAME: String = configuration.get[String]("ldap_role")

  def signIn(signInRequest: SignInRequest): Future[AuthResponse] =
    for {
      ldapUser <- ldapService
        .authenticate(signInRequest.username, signInRequest.password)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
      user <- userService
        .getUserByUsername(ldapUser.username)
        .recoverWith {
          // Create a new user entry
          case _: UserService.Exceptions.NotFound => handleFirstSignIn(ldapUser)
          case e: ServiceException                => serviceErrorMapper(e)
        }
    } yield tokenService
      .obtainTokens(
        AccessTokenContent(user.id),
        RefreshTokenContent(user.id, None),
        Instant.now.getEpochSecond
      )

  private def handleFirstSignIn(ldapUser: User): Future[User] =
    for {
      user <- userService
        .addUser(ldapUser)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
      _ <- postgreSQLEngine
        .createRoleInGroup(user.username, LDAP_GROUP_NAME)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
    } yield user

  def refreshToken(refreshTokenRequest: RefreshTokenRequest): Future[AuthResponse] = {
    val currentTimestamp = Instant.now.getEpochSecond
    tokenService.refreshTokens(refreshTokenRequest.refreshToken, currentTimestamp) match {
      case Some(authResponse) => Future.successful(authResponse)
      case None               => Future.failed(Exceptions.AccessDenied("Refresh token expired"))
    }
  }

  def serviceErrorMapper(exception: ServiceException): Future[Nothing] = {
    logger.error(exception.getMessage)
    exception match {
      case e: LdapService.Exceptions.AccessDenied     => Future.failed(Exceptions.AccessDenied(e.getMessage))
      case e: LdapService.Exceptions.EnvironmentError => Future.failed(Exceptions.InternalError(e.getMessage))
      case e: LdapService.Exceptions.InternalError    => Future.failed(Exceptions.InternalError(e.getMessage))

      case _: Throwable => internalError("Uncaught exception")
    }
  }

  private def internalError(errorMessage: String): Future[Nothing] = {
    logger.error(errorMessage)
    Future.failed(Exceptions.InternalError(errorMessage))
  }
}

object AuthManager {
  object Exceptions {
    sealed abstract class AuthManagerException(message: String) extends ManagerException(message)

    final case class AccessDenied(message: String = "Access denied") extends AuthManagerException(message)
    final case class InternalError(message: String = "Internal error") extends AuthManagerException(message)
  }
}
