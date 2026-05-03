package com.htwhub.ocean.service

import com.htwhub.ocean.models.{Instance, InstanceId, User, UserId}
import com.htwhub.ocean.models.Instance.EngineType
import com.htwhub.ocean.repositories.InstanceRepository
import com.htwhub.ocean.service.exceptions.ServiceException
import com.htwhub.ocean.service.InstanceService.Exceptions.AccessDenied
import com.htwhub.ocean.service.InstanceService.Exceptions.InternalError
import com.htwhub.ocean.service.InstanceService.Exceptions.NotFound

import javax.inject.Inject
import play.api.Logger

import scala.concurrent.ExecutionContext
import scala.concurrent.Future


class InstanceService @Inject() (instanceRepository: InstanceRepository)(implicit
  ec: ExecutionContext
) {

  val logger: Logger = Logger(this.getClass)

  def getAllInstancesWithPermission(user: User): Future[Seq[Instance]] = {
    for {
      _hasPermission <- this.getPermissionOrFail(user)
      instances <- instanceRepository.getAllInstances
    } yield instances
  }

  def getUserInstanceById(instanceId: InstanceId, userId: UserId): Future[Instance] =
    instanceRepository
      .getInstanceById(instanceId)
      .recoverWith { case t: Throwable =>
        internalError(t.getMessage)
      }
      .flatMap(instance => getForUserOrFail(instance.toSeq, userId))

  def getUserInstanceWithPermission(instanceId: InstanceId, user: User): Future[Instance] = {
    val result = for {
      _ <- this.getPermissionOrFail(user)
      instance <- instanceRepository.getInstanceById(instanceId)
    } yield instance

    result flatMap  {
      case Some(value) => Future.successful(value)
      case None => Future.failed(AccessDenied())
    }
  }

  def getUserInstances(userId: UserId): Future[Seq[Instance]] =
    instanceRepository
      .getInstancesByUserId(userId)
      .recoverWith { case t: Throwable =>
        internalError(t.getMessage)
      }

  def getInstanceAvailability(name: String, engine: EngineType): Future[Boolean] =
    instanceRepository
      .getInstancesByName(name)
      .recoverWith { case t: Throwable =>
        internalError(t.getMessage)
      }
      .flatMap(instances =>
        instances.find(_.engine == engine) match {
          case Some(_) => Future.successful(false)
          case None    => Future.successful(true)
        }
      )

  private def getPermissionOrFail(user: User): Future[Boolean] = {
    user.employeeType match {
      case string: String if string.contains("Staff") => Future.successful(true)
      case _               => Future.failed(AccessDenied())
    }
  }

  private def getForUserOrFail(instances: Seq[Instance], userId: UserId): Future[Instance] =
    instances.find(_.userId == userId) match {
      case Some(instance)             => Future.successful(instance)
      case None if instances.nonEmpty => Future.failed(AccessDenied())
      case _                          => Future.failed(NotFound())
    }

  def addInstance(localInstance: Instance, userId: UserId): Future[Instance] =
    instanceRepository
      .addInstance(localInstance)
      .recoverWith { case t: Throwable =>
        internalError(t.getMessage)
      }
      .flatMap(instanceId => getUserInstanceById(instanceId, userId))

  def deleteInstance(instanceId: InstanceId, userId: UserId): Future[Int] =
    getUserInstanceById(instanceId, userId)
      .flatMap(instance =>
        instanceRepository
          .deleteInstanceById(instance.id)
          .recoverWith { case t: Throwable =>
            internalError(t.getMessage)
          }
      )

  private def internalError(errorMessage: String): Future[Nothing] = {
    logger.error(errorMessage)
    Future.failed(InternalError(errorMessage))
  }
}

object InstanceService {
  object Exceptions {
    sealed abstract class InstanceServiceException(message: String) extends ServiceException(message)

    final case class NotFound(message: String = "Instance not found") extends InstanceServiceException(message)
    final case class AccessDenied(message: String = "Access denied. You are not the instance owner")
        extends InstanceServiceException(message)
    final case class InternalError(message: String = "Internal error") extends InstanceServiceException(message)
  }
}
