package com.htwhub.ocean.managers

import com.htwhub.ocean.engines.MongoDBEngine
import com.htwhub.ocean.engines.PostgreSQLEngine
import com.htwhub.ocean.managers.exceptions.ManagerException
import com.htwhub.ocean.managers.DatabaseManager.Exceptions
import com.htwhub.ocean.models.Instance
import com.htwhub.ocean.models.Instance.MongoDBSQLEngineType
import com.htwhub.ocean.models.Instance.PostgreSQLEngineType
import com.htwhub.ocean.models.InstanceId
import com.htwhub.ocean.models.User
import com.htwhub.ocean.serializers.database.AvailabilityDatabaseRequest
import com.htwhub.ocean.serializers.database.CreateDatabaseRequest
import com.htwhub.ocean.service.exceptions.ServiceException
import com.htwhub.ocean.service.InstanceService
import com.htwhub.ocean.service.InvitationService
import com.htwhub.ocean.service.RoleService
import com.htwhub.ocean.service.UserService
import java.sql.Timestamp
import java.time.Instant
import javax.inject.Inject
import org.mongodb.scala.Completed
import play.api.Logger
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

class DatabaseManager @Inject() (
  instanceService: InstanceService,
  roleService: RoleService,
  invitationService: InvitationService,
  userService: UserService,
  postgreSQLEngine: PostgreSQLEngine,
  mongoDBEngine: MongoDBEngine
)(implicit
  ec: ExecutionContext
) {

  val logger: Logger = Logger(this.getClass)

  def getAllInstances(user: User): Future[Seq[Instance]] =
    instanceService
      .getAllInstancesWithPermission(user)
      .recoverWith { case e: ServiceException => serviceErrorMapper(e) }

  def getUserInstances(user: User): Future[Seq[Instance]] =
    instanceService
      .getUserInstances(user.id)
      .recoverWith { case e: ServiceException => serviceErrorMapper(e) }

  def getUserInstanceById(instanceId: InstanceId, user: User): Future[Instance] =
    instanceService
      .getUserInstanceById(instanceId, user.id)
      .recoverWith { case e: ServiceException => serviceErrorMapper(e) }

  def getInstanceAvailability(availabilityDatabaseRequest: AvailabilityDatabaseRequest): Future[Boolean] =
    instanceService
      .getInstanceAvailability(availabilityDatabaseRequest.name, availabilityDatabaseRequest.engine)
      .recoverWith { case e: ServiceException => serviceErrorMapper(e) }

  def addDatabase(createDatabaseRequest: CreateDatabaseRequest, user: User): Future[Instance] = {
    val localInstance = Instance(
      InstanceId(0),
      user.id,
      createDatabaseRequest.name,
      createDatabaseRequest.engine,
      Timestamp.from(Instant.now)
    )
    for {
      instance <- instanceService
        .addInstance(localInstance, user.id)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
      _ <- instance match {
        case value: Instance if value.engine == PostgreSQLEngineType => addDatabaseForPostgreSQL(value, user)
        case value: Instance if value.engine == MongoDBSQLEngineType => addDatabaseForMongoDB(value)
      }
    } yield instance
  }

  def addDatabaseForPostgreSQL(instance: Instance, user: User): Future[List[Int]] =
    for {
      job1 <- postgreSQLEngine
        .createDatabase(instance.name)
        .recoverWith { t: Throwable => internalError(t.getMessage) }
      job2 <- postgreSQLEngine
        .revokePublicAccess(instance.name)
        .recoverWith { t: Throwable => internalError(t.getMessage) }
      job3 <- postgreSQLEngine
        .grantDatabaseAccess(instance.name, user.username)
        .recoverWith { t: Throwable => internalError(t.getMessage) }
      job4 <- postgreSQLEngine
        .grantAccessToPublicSchema(instance.name)
        .recoverWith { t: Throwable => internalError(t.getMessage) }

    } yield job1.toList ++ job2.toList ++ job3.toList ++ job4.toList

  def addDatabaseForMongoDB(instance: Instance): Future[Completed] =
    for {
      job1 <- mongoDBEngine
        .createDatabase(instance.name)
        .recoverWith { t: Throwable => internalError(t.getMessage) }
    } yield job1

  def deleteDatabase(instanceId: InstanceId, user: User): Future[List[Int]] =
    for {
      instance <- instanceService
        .getUserInstanceById(instanceId, user.id)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
      job1 <- instance match {
        case value: Instance if instance.engine == PostgreSQLEngineType => deleteDatabaseForPostgreSQL(value, user)
        case value: Instance if instance.engine == MongoDBSQLEngineType => deleteDatabaseForMongoDB(value, user)
      }
    } yield job1

  def deleteDatabaseWithPermission(instanceId: InstanceId, user: User): Future[List[Int]] =
    for {
      instance <- instanceService
        .getUserInstanceWithPermission(instanceId, user)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
      instanceOwner <- userService.getUserById(instance.userId)
      job1 <- instance match {
        case value: Instance if instance.engine == PostgreSQLEngineType =>
          deleteDatabaseForPostgreSQL(value, instanceOwner)
        case value: Instance if instance.engine == MongoDBSQLEngineType =>
          deleteDatabaseForMongoDB(value, instanceOwner)
      }
    } yield job1

  def deleteDatabaseForPostgreSQL(instance: Instance, user: User): Future[List[Int]] =
    for {
      job1 <- deleteRolesForPostgreSQL(instance, user)
      job2 <- deleteInvitationsForPostgreSQL(instance, user)
      job3 <- postgreSQLEngine
        .deleteDatabase(instance.name)
        .recoverWith { t: Throwable => internalError(t.getMessage) }
      job4 <- instanceService
        .deleteInstance(instance.id, user.id)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
    } yield job1 ++ job2 ++ job3.toList ++ List(job4)

  def deleteRolesForPostgreSQL(instance: Instance, user: User): Future[List[Int]] =
    for {
      roles <- roleService
        .getRolesByInstanceId(instance.id, user.id)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
      job1 <- roleService
        .deleteRolesByInstanceId(instance.id, user.id)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
      job2 <- postgreSQLEngine
        .dropRolesComplete(roles.map(_.name).toList)
        .recoverWith { t: Throwable => internalError(t.getMessage) }
    } yield List(job1) ++ job2.map(_.sum)

  def deleteInvitationsForPostgreSQL(instance: Instance, user: User): Future[List[Int]] =
    for {
      invitations <- invitationService
        .getInvitationsByInstanceId(instance.id, user.id)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
      users <- userService.getUsersByIds(invitations.map(_.userId).toList)
      job1 <- postgreSQLEngine
        .revokeDatabaseAccessBulk(users.map(_.username), instance.name)
        .recoverWith { t: Throwable => internalError(t.getMessage) }
      job2 <- invitationService
        .deleteInvitationsByIds(invitations.map(_.id).toList, user.id)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
    } yield job1.map(_.sum) ++ job2

  def deleteDatabaseForMongoDB(instance: Instance, user: User): Future[List[Int]] =
    for {
      job1 <- deleteRolesForMongoDB(instance, user)
      _ <- mongoDBEngine
        .deleteDatabase(instance.name)
        .recoverWith { t: Throwable => internalError(t.getMessage) }
      job3 <- instanceService
        .deleteInstance(instance.id, user.id)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
    } yield job1 ++ List(job3)

  def deleteRolesForMongoDB(instance: Instance, user: User): Future[List[Int]] =
    for {
      roles <- roleService
        .getRolesByInstanceId(instance.id, user.id)
      job1 <- roleService
        .deleteRolesByIds(roles.map(_.id).toList, user.id)
        .recoverWith { case e: ServiceException => serviceErrorMapper(e) }
      job2 <- mongoDBEngine
        .deleteUsers(instance.name, roles.map(_.name).toList)
        .recoverWith { t: Throwable => internalError(t.getMessage) }
    } yield job1

  def serviceErrorMapper(exception: ServiceException): Future[Nothing] = {
    logger.error(exception.getMessage)
    exception match {
      case _: InstanceService.Exceptions.AccessDenied   => Future.failed(Exceptions.AccessDenied())
      case _: InstanceService.Exceptions.NotFound       => Future.failed(Exceptions.NotFound())
      case e: InstanceService.Exceptions.InternalError  => Future.failed(Exceptions.InternalError(e.getMessage))
      case _: RoleService.Exceptions.AccessDenied       => Future.failed(Exceptions.AccessDenied())
      case _: RoleService.Exceptions.NotFound           => Future.failed(Exceptions.NotFound())
      case e: RoleService.Exceptions.InternalError      => Future.failed(Exceptions.InternalError(e.getMessage))
      case _: InvitationService.Exceptions.AccessDenied => Future.failed(Exceptions.AccessDenied())
      case _: InvitationService.Exceptions.NotFound     => Future.failed(Exceptions.NotFound())
      case e: InvitationService.Exceptions.InternalError =>
        Future.failed(Exceptions.InternalError(e.getMessage))

      case _: Throwable => internalError("Uncaught exception")
    }
  }

  private def internalError(errorMessage: String): Future[Nothing] = {
    logger.error(errorMessage)
    Future.failed(Exceptions.InternalError(errorMessage))
  }

}

object DatabaseManager {
  object Exceptions {
    sealed abstract class DatabaseManagerException(message: String) extends ManagerException(message)

    final case class NotFound(message: String = "Database not found") extends DatabaseManagerException(message)
    final case class AccessDenied(message: String = "Access denied. You are not the database owner")
        extends DatabaseManagerException(message)
    final case class InternalError(message: String = "Internal error") extends DatabaseManagerException(message)
  }
}
