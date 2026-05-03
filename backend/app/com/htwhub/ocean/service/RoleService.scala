package com.htwhub.ocean.service

import com.htwhub.ocean.models.InstanceId
import com.htwhub.ocean.models.Role
import com.htwhub.ocean.models.RoleId
import com.htwhub.ocean.models.UserId
import com.htwhub.ocean.repositories.RoleRepository
import com.htwhub.ocean.service.exceptions.ServiceException
import com.htwhub.ocean.service.InstanceService.Exceptions.InstanceServiceException
import com.htwhub.ocean.service.RoleService.Exceptions
import javax.inject.Inject
import play.api.Logger
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

// TODO: user permission check
class RoleService @Inject() (roleRepository: RoleRepository, instanceService: InstanceService)(implicit
  ec: ExecutionContext,
) {

  val logger: Logger = Logger(this.getClass)

  def getRolesByInstanceId(instanceId: InstanceId, userId: UserId): Future[Seq[Role]] =
    instanceService
      .getUserInstanceById(instanceId, userId)
      .recoverWith { case e: InstanceServiceException => serviceErrorMapper(e) }
      .flatMap(_ =>
        roleRepository
          .getRolesByInstanceId(instanceId)
          .recoverWith { case t: Throwable => internalError(t.getMessage) }
      )

  def getRoleByById(roleId: RoleId, userId: UserId): Future[Role] =
    roleRepository
      .getRoleById(roleId)
      .recoverWith { case t: Throwable => internalError(t.getMessage) }
      .flatMap {
        case None       => notFoundRoleError(roleId)
        case Some(role) => Future.successful(role)
      }

  def getRoleAvailability(instanceId: InstanceId, roleName: String): Future[Boolean] =
    roleRepository
      .getRolesByInstanceId(instanceId)
      .recoverWith { case t: Throwable =>
        internalError(t.getMessage)
      }
      .flatMap(roles =>
        roles.find(_.name == roleName) match {
          case Some(_) => Future.successful(false)
          case None    => Future.successful(true)
        }
      )

  def addRole(localRole: Role, userId: UserId): Future[Role] =
    roleRepository
      .addRole(localRole)
      .recoverWith { case t: Throwable => internalError(t.getMessage) }
      .flatMap(roleId => getRoleByById(roleId, userId))

  def deleteRoleById(roleId: RoleId, userId: UserId): Future[Int] =
    roleRepository
      .deleteRoleById(roleId)
      .recoverWith { case t: Throwable => internalError(t.getMessage) }

  def deleteRolesByIds(roleIds: List[RoleId], userId: UserId): Future[List[Int]] = {
    val jobs: List[Future[Int]] = roleIds map { roleId =>
      deleteRoleById(roleId, userId)
    }
    Future.sequence(jobs)
  }

  def deleteRolesByInstanceId(instanceId: InstanceId, userId: UserId): Future[Int] =
    instanceService
      .getUserInstanceById(instanceId, userId)
      .recoverWith { case e: InstanceServiceException => serviceErrorMapper(e) }
      .flatMap(_ =>
        roleRepository
          .deleteRolesByInstanceId(instanceId)
          .recoverWith { case t: Throwable => internalError(t.getMessage) }
      )

  private def serviceErrorMapper(exception: InstanceServiceException): Future[Nothing] = {
    logger.error(exception.getMessage)
    exception match {
      case _: InstanceService.Exceptions.AccessDenied  => Future.failed(Exceptions.AccessDenied())
      case _: InstanceService.Exceptions.NotFound      => Future.failed(Exceptions.NotFound())
      case e: InstanceService.Exceptions.InternalError => Future.failed(Exceptions.InternalError(e.getMessage))
    }
  }

  private def internalError(errorMessage: String): Future[Nothing] = {
    logger.error(errorMessage)
    Future.failed(Exceptions.InternalError(errorMessage))
  }

  private def notFoundRoleError(roleId: RoleId) =
    Future.failed(Exceptions.NotFound(s"There is no role with role_id: ${roleId.value}"))

}

object RoleService {
  object Exceptions {
    sealed abstract class RoleServiceException(message: String) extends ServiceException(message)

    final case class NotFound(message: String = "Role not found") extends RoleServiceException(message)
    final case class AccessDenied(message: String = "Access denied. You are not the instance owner")
        extends RoleServiceException(message)
    final case class InternalError(message: String = "Internal error") extends RoleServiceException(message)
  }
}
