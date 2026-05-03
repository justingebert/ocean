package com.htwhub.ocean.service

import com.htwhub.ocean.engines.PostgreSQLEngine
import com.htwhub.ocean.service.exceptions.ServiceException
import com.htwhub.ocean.service.OnStartupService.Exceptions
import javax.inject.Inject
import play.api.Configuration
import play.api.Logger
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

class OnStartupService @Inject() (config: Configuration, postgreSQLEngine: PostgreSQLEngine)(implicit
  ec: ExecutionContext
) {

  val logger: Logger = Logger(this.getClass)

  // Expects module binding
  onStartup()

  def onStartup(): Future[List[Vector[Int]]] = {
    print("hi")
    val job1 = checkLdapRole()
    val job2 = checkGenericRole()
    val jobs = List(job1, job2)
    Future.sequence(jobs)
  }

  def checkLdapRole(): Future[Vector[Int]] =
    for {
      ldapRoleName <- getConfigurationFor("ldap_role")
      existsLdapRole <- postgreSQLEngine
        .existsRole(ldapRoleName)
        .recoverWith { case t: Throwable => internalError(t.getMessage) }
      job <- existsLdapRole match {
        case value if value.isEmpty => postgreSQLEngine.createGroup(ldapRoleName)
        case _                      => Future.successful(Vector(0))
      }
    } yield job

  def checkGenericRole(): Future[Vector[Int]] =
    for {
      genericRoleName <- getConfigurationFor("generic_role")
      existsGenericRole <- postgreSQLEngine
        .existsRole(genericRoleName)
        .recoverWith { case t: Throwable => internalError(t.getMessage) }
      job <- existsGenericRole match {
        case value if value.isEmpty => postgreSQLEngine.createGroup(genericRoleName)
        case _                      => Future.successful(Vector(0))
      }
    } yield job

  def getConfigurationFor(key: String): Future[String] =
    config.getOptional[String](key) match {
      case None        => internalError("Configuration ldap_role missing")
      case Some(value) => Future.successful(value)
    }

  private def internalError(errorMessage: String): Future[Nothing] = {
    logger.error(errorMessage)
    Future.failed(Exceptions.InternalError(errorMessage))
  }
}

object OnStartupService {
  object Exceptions {
    sealed abstract class OnStartupServiceException(message: String) extends ServiceException(message)

    final case class InternalError(message: String = "Internal error") extends OnStartupServiceException(message)
  }
}
