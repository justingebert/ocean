package com.htwhub.ocean.managers

import com.htwhub.ocean.engines.PostgreSQLEngine
import com.htwhub.ocean.managers.exceptions.ManagerException
import com.htwhub.ocean.managers.InvitationManager.Exceptions
import com.htwhub.ocean.models.Instance
import com.htwhub.ocean.models.InstanceId
import com.htwhub.ocean.models.Invitation
import com.htwhub.ocean.models.InvitationId
import com.htwhub.ocean.models.User
import com.htwhub.ocean.models.UserId
import com.htwhub.ocean.serializers.invitation.CreateInvitationRequest
import com.htwhub.ocean.service.exceptions.ServiceException
import com.htwhub.ocean.service.InstanceService
import com.htwhub.ocean.service.InvitationService
import com.htwhub.ocean.service.UserService
import java.sql.Timestamp
import java.time.Instant
import javax.inject.Inject
import play.api.Logger
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

class InvitationManager @Inject() (
  invitationService: InvitationService,
  instanceService: InstanceService,
  userService: UserService,
  postgreSQLEngine: PostgreSQLEngine,
)(implicit
  ec: ExecutionContext
) {

  val logger: Logger = Logger(this.getClass)

  def getInvitationsByInstanceId(instanceId: InstanceId, user: User): Future[Seq[Invitation]] =
    invitationService
      .getInvitationsByInstanceId(instanceId, user.id)
      .recoverWith { case e: ServiceException => serviceErrorMapper(e) }

  def addInvitation(createRoleRequest: CreateInvitationRequest, user: User): Future[Invitation] =
    for {
      instance <- instanceService
        .getUserInstanceById(InstanceId(createRoleRequest.instanceId), user.id)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
      invitedUser <- userService
        .getUserById(UserId(createRoleRequest.userId))
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
      invitation <- instance match {
        case _ if instance.engine == Instance.PostgreSQLEngineType =>
          addInvitationForPostgreSQL(createRoleRequest, instance, user, invitedUser)
        case _ => internalError("Wrong engine type")
      }
    } yield invitation

  def addInvitationForPostgreSQL(
    createRoleRequest: CreateInvitationRequest,
    instance: Instance,
    user: User,
    invitedUser: User
  ): Future[Invitation] = {
    val localInvitation = Invitation(
      InvitationId(0),
      InstanceId(createRoleRequest.instanceId),
      UserId(createRoleRequest.userId),
      Timestamp.from(Instant.now)
    )
    for {
      invitation <- invitationService
        .addInvitation(localInvitation, user.id)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
      _ <- postgreSQLEngine
        .grantDatabaseAccess(instance.name, invitedUser.username)
        .recoverWith { t: Throwable => internalError(t.getMessage) }
    } yield invitation
  }

  def deleteInvitationById(invitationId: InvitationId, user: User): Future[List[Int]] =
    for {
      invitation <- invitationService
        .getInvitationById(invitationId)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
      instance <- instanceService
        .getUserInstanceById(invitation.instanceId, user.id)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
      invitedUser <- userService
        .getUserById(invitation.userId)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
      job1 <- deleteInvitationForPostgreSQL(instance, invitation, invitedUser, user)
    } yield job1

  def deleteInvitationForPostgreSQL(
    instance: Instance,
    invitation: Invitation,
    invitedUser: User,
    user: User
  ): Future[List[Int]] =
    for {
      job1 <- postgreSQLEngine
        .revokeDatabaseAccess(invitedUser.username, instance.name)
        .recoverWith { t: Throwable => internalError(t.getMessage) }
      job2 <- invitationService
        .deleteInvitationById(invitation.id, user.id)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
    } yield job1.toList ++ List(job2)

  def serviceErrorMapper(exception: ServiceException): Future[Nothing] = {
    logger.error(exception.getMessage)
    exception match {
      case _: InvitationService.Exceptions.AccessDenied  => Future.failed(Exceptions.AccessDenied())
      case _: InvitationService.Exceptions.NotFound      => Future.failed(Exceptions.NotFound())
      case e: InvitationService.Exceptions.InternalError => Future.failed(Exceptions.InternalError(e.getMessage))
      case _: InstanceService.Exceptions.AccessDenied    => Future.failed(Exceptions.AccessDenied())
      case _: InstanceService.Exceptions.NotFound        => Future.failed(Exceptions.NotFound())
      case e: InstanceService.Exceptions.InternalError   => Future.failed(Exceptions.InternalError(e.getMessage))
      case _: UserService.Exceptions.AccessDenied        => Future.failed(Exceptions.AccessDenied())
      case _: UserService.Exceptions.NotFound            => Future.failed(Exceptions.NotFound())
      case e: UserService.Exceptions.InternalError       => Future.failed(Exceptions.InternalError(e.getMessage))

      case _: Throwable => internalError("Uncaught exception")
    }
  }

  private def internalError(errorMessage: String): Future[Nothing] = {
    logger.error(errorMessage)
    Future.failed(Exceptions.InternalError(errorMessage))
  }
}

object InvitationManager {
  object Exceptions {
    sealed abstract class InvitationManagerException(message: String) extends ManagerException(message)

    final case class NotFound(message: String = "Invitation not found") extends InvitationManagerException(message)
    final case class AccessDenied(message: String = "Access denied. You are not the invitation owner")
        extends InvitationManagerException(message)
    final case class InternalError(message: String = "Internal error") extends InvitationManagerException(message)
  }
}
