package com.htwhub.ocean.managers

import com.htwhub.ocean.managers.exceptions.ManagerException
import com.htwhub.ocean.managers.UserManager.Exceptions
import com.htwhub.ocean.models.User
import com.htwhub.ocean.models.UserId
import com.htwhub.ocean.service.exceptions.ServiceException
import com.htwhub.ocean.service.UserService
import javax.inject.Inject
import play.api.Logger
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

class UserManager @Inject() (
  userService: UserService,
)(implicit
  ec: ExecutionContext
) {

  val logger: Logger = Logger(this.getClass)

  def getUserById(userId: UserId): Future[User] =
    userService
      .getUserById(userId)
      .recoverWith { case e: ServiceException => serviceErrorMapper(e) }

  def getUsers: Future[Seq[User]] =
    userService.getUsers
      .recoverWith { case e: ServiceException => serviceErrorMapper(e) }

  def serviceErrorMapper(exception: ServiceException): Future[Nothing] = {
    logger.error(exception.getMessage)
    exception match {
      case _: UserService.Exceptions.AccessDenied => Future.failed(Exceptions.AccessDenied())
      case _: UserService.Exceptions.NotFound     => Future.failed(Exceptions.NotFound())
      case e: UserService.Exceptions.InternalError =>
        Future.failed(Exceptions.InternalError(e.getMessage))
        Future.failed(Exceptions.InternalError(e.getMessage))

      case _: Throwable => internalError("Uncaught exception")
    }
  }

  private def internalError(errorMessage: String): Future[Nothing] = {
    logger.error(errorMessage)
    Future.failed(Exceptions.InternalError(errorMessage))
  }
}

object UserManager {
  object Exceptions {
    sealed abstract class UserManagerException(message: String) extends ManagerException(message)

    final case class NotFound(message: String = "User not found") extends UserManagerException(message)
    final case class AccessDenied(message: String = "Access denied. You are not the user owner")
        extends UserManagerException(message)
    final case class InternalError(message: String = "Internal error") extends UserManagerException(message)
  }
}
