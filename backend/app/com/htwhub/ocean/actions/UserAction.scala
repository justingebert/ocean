package com.htwhub.ocean.actions

import com.htwhub.ocean.actions.UserAction.Exceptions.InvalidAccessTokenRejection
import com.htwhub.ocean.actions.UserAction.Exceptions.InvalidAuthContentRejection
import com.htwhub.ocean.actions.UserAction.Exceptions.MissingAccessTokenRejection
import com.htwhub.ocean.actions.UserAction.Exceptions.UserActionException
import com.htwhub.ocean.models.User
import com.htwhub.ocean.serializers.auth.AccessTokenContent
import com.htwhub.ocean.serializers.auth.AuthContent
import com.htwhub.ocean.service.TokenService
import com.htwhub.ocean.service.UserService
import javax.inject.Inject
import play.api.http.HeaderNames
import play.api.libs.json.Json
import play.api.mvc.ActionBuilder
import play.api.mvc.AnyContent
import play.api.mvc.BodyParser
import play.api.mvc.BodyParsers
import play.api.mvc.Request
import play.api.mvc.Result
import play.api.mvc.Results.BadRequest
import play.api.mvc.Results.Unauthorized
import play.api.mvc.WrappedRequest
import play.api.Logger
import play.api.Logging
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

case class UserRequest[A](user: User, request: Request[A]) extends WrappedRequest[A](request)

class UserAction @Inject() (
  bodyParser: BodyParsers.Default,
  tokenService: TokenService,
  userService: UserService
)(implicit ec: ExecutionContext)
    extends ActionBuilder[UserRequest, AnyContent]
    with Logging {

  override def parser: BodyParser[AnyContent] = bodyParser

  override def invokeBlock[A](request: Request[A], block: UserRequest[A] => Future[Result]): Future[Result] =
    processRequest(request)
      .flatMap { user: User =>
        block(UserRequest(user, request))
      }
      .recoverWith { case e: UserActionException =>
        exceptionToResult(e)
      }

  def processRequest[A](request: Request[A]): Future[User] =
    extractBearerToken(request) match {
      case None => Future.failed(MissingAccessTokenRejection())
      case Some(token) =>
        tokenService
          .getOptJwtClaims(token)
          .map(claims => Json.parse(claims.content).as[AuthContent]) match {
          case None => Future.failed(InvalidAccessTokenRejection())
          case Some(accessTokenContent: AccessTokenContent) =>
            userService
              .getUserById(accessTokenContent.userId)
              .recoverWith { case _: Throwable => Future.failed(InvalidAuthContentRejection()) }
        }
    }

  private def extractBearerToken[A](request: Request[A]): Option[String] = {
    val headerTokenRegex = """Bearer (.+?)""".r
    request.headers.get(HeaderNames.AUTHORIZATION) collect { case headerTokenRegex(token) =>
      token
    }
  }

  def exceptionToResult(error: UserActionException): Future[Result] = {
    logger.warn(error.getMessage)
    error match {
      case _: UserAction.Exceptions.MissingAccessTokenRejection => Future.successful(Unauthorized(error.getMessage))
      case _: UserAction.Exceptions.InvalidAccessTokenRejection => Future.successful(Unauthorized(error.getMessage))
      case _: UserAction.Exceptions.InvalidAuthContentRejection => Future.successful(Unauthorized(error.getMessage))
      case _: UserAction.Exceptions.InternalError               => Future.successful(BadRequest(error.getMessage))
    }
  }

  protected override def executionContext: ExecutionContext = ec

}

object UserAction {
  object Exceptions {
    sealed abstract class UserActionException(message: String) extends Exception(message)

    final case class MissingAccessTokenRejection(message: String = "Access token missing")
        extends UserActionException(message)
    final case class InvalidAccessTokenRejection(message: String = "Invalid access token")
        extends UserActionException(message)
    final case class InvalidAuthContentRejection(message: String = "Invalid claim") extends UserActionException(message)
    final case class InternalError(message: String = "Oops. Something went wrong :(")
        extends UserActionException(message)
  }
}
