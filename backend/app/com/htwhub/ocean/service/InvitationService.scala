package com.htwhub.ocean.service

import com.htwhub.ocean.models.InstanceId
import com.htwhub.ocean.models.Invitation
import com.htwhub.ocean.models.InvitationId
import com.htwhub.ocean.models.UserId
import com.htwhub.ocean.repositories.InvitationRepository
import com.htwhub.ocean.service.exceptions.ServiceException
import com.htwhub.ocean.service.InstanceService.Exceptions.InstanceServiceException
import com.htwhub.ocean.service.InvitationService.Exceptions
import javax.inject.Inject
import play.api.Logger
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

// TODO: permission check
class InvitationService @Inject() (invitationRepository: InvitationRepository, instanceService: InstanceService)(
  implicit ec: ExecutionContext
) {
  val logger: Logger = Logger(this.getClass)

  def getInvitationsByInstanceId(instanceId: InstanceId, userId: UserId): Future[Seq[Invitation]] =
    instanceService
      .getUserInstanceById(instanceId, userId)
      .recoverWith { case e: InstanceServiceException => serviceErrorMapper(e) }
      .flatMap(_ =>
        invitationRepository
          .getInvitationsByInstanceId(instanceId)
          .recoverWith { case t: Throwable => internalError(t.getMessage) }
      )

  def getInvitationById(invitationId: InvitationId): Future[Invitation] =
    invitationRepository
      .getInvitationById(invitationId)
      .recoverWith { case t: Throwable => internalError(t.getMessage) }
      .flatMap {
        case None             => notFoundInvitationError(invitationId)
        case Some(invitation) => Future.successful(invitation)
      }

  def addInvitation(invitation: Invitation, userId: UserId): Future[Invitation] =
    invitationRepository
      .addInvitation(invitation)
      .recoverWith { case t: Throwable => internalError(t.getMessage) }
      .flatMap(invitationId => getInvitationById(invitationId))

  def deleteInvitationById(invitationId: InvitationId, userId: UserId): Future[Int] =
    invitationRepository
      .deleteInvitationById(invitationId)
      .recoverWith { case t: Throwable => internalError(t.getMessage) }

  def deleteInvitationsByIds(invitationIds: List[InvitationId], userId: UserId): Future[List[Int]] = {
    val jobs = invitationIds map { invitationId => deleteInvitationById(invitationId, userId) }
    Future.sequence(jobs)
  }

  private def serviceErrorMapper(exc: InstanceServiceException): Future[Nothing] =
    exc match {
      case _: InstanceService.Exceptions.AccessDenied  => Future.failed(Exceptions.AccessDenied())
      case _: InstanceService.Exceptions.NotFound      => Future.failed(Exceptions.NotFound())
      case e: InstanceService.Exceptions.InternalError => Future.failed(Exceptions.InternalError(e.getMessage))
    }

  private def internalError(errorMessage: String): Future[Nothing] = {
    logger.error(errorMessage)
    Future.failed(Exceptions.InternalError(errorMessage))
  }

  private def notFoundInvitationError(invitationId: InvitationId) =
    Future.failed(Exceptions.NotFound(s"There is no invitation with invitation_id: ${invitationId.value}"))
}

object InvitationService {
  object Exceptions {
    sealed abstract class InvitationServiceException(message: String) extends ServiceException(message)

    final case class NotFound(message: String = "Invitation not found") extends InvitationServiceException(message)
    final case class AccessDenied(message: String = "Access denied. You are not the instance owner")
        extends InvitationServiceException(message)
    final case class InternalError(message: String = "Internal error") extends InvitationServiceException(message)
  }
}
