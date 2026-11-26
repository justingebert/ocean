package com.htwhub.ocean.repositories

import com.htwhub.ocean.models.Instance
import com.htwhub.ocean.models.Instance.EngineType
import com.htwhub.ocean.models.InstanceId
import com.htwhub.ocean.models.UserId
import java.sql.Timestamp
import javax.inject.Inject
import javax.inject.Singleton
import play.api.db.slick.DatabaseConfigProvider
import scala.concurrent.ExecutionContext
import scala.concurrent.Future
import slick.jdbc.JdbcProfile
import slick.sql.SqlProfile.ColumnOption.SqlType

@Singleton
class InstanceRepository @Inject() (dbConfigProvider: DatabaseConfigProvider, userRepository: UserRepository)(implicit
  ec: ExecutionContext
) {

  protected val dbConfig = dbConfigProvider.get[JdbcProfile]

  import dbConfig._
  import profile.api._

  class InstanceTable(tag: Tag) extends Table[Instance](tag, "instances") {

    def id = column[InstanceId]("id", O.PrimaryKey, O.AutoInc)
    def userId = column[UserId]("user_id")
    def name = column[String]("name")
    def engine = column[EngineType]("engine")
    def createdAt = column[Timestamp](
      "created_at",
      SqlType("timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP")
    )
    def expiresAt = column[Option[Timestamp]]("expires_at")
    def remindersSent = column[Int]("reminders_sent")
    def * = (id, userId, name, engine, createdAt, expiresAt, remindersSent) <> (
      (Instance.apply _).tupled,
      Instance.unapply
    )
    def idx_name_engine = index("idx_name_engine", (name, engine), unique = true)
    // TODO: fix Compilation error[private value userRepository escapes its defining scope
    foreignKey("fk_instance_user", userId, TableQuery[userRepository.UserTable])(
      _.id,
      onDelete = ForeignKeyAction.Cascade
    )
  }

  protected val instances = TableQuery[InstanceTable]

  def getAllInstances: Future[Seq[Instance]] =
    dbConfig.db.run(instances.result)

  def getInstancesByUserId(userId: UserId): Future[Seq[Instance]] =
    dbConfig.db.run(
      instances.filter(_.userId === userId).result
    )

  def getInstancesByName(name: String): Future[Seq[Instance]] =
    dbConfig.db.run(
      instances.filter(_.name === name).result
    )

  def getInstanceById(instanceId: InstanceId): Future[Option[Instance]] =
    dbConfig.db.run(
      instances.filter(_.id === instanceId).result.headOption
    )

  def addInstance(instance: Instance): Future[InstanceId] =
    dbConfig.db.run(
      instances.returning(instances.map(_.id)) += instance
    )

  /** Sets a new expiry date (`None` = never expires) and restarts the reminder sequence. */
  def updateExpiry(instanceId: InstanceId, expiresAt: Option[Timestamp]): Future[Int] =
    dbConfig.db.run(
      instances.filter(_.id === instanceId).map(i => (i.expiresAt, i.remindersSent)).update((expiresAt, 0))
    )

  def getExpiringInstances: Future[Seq[Instance]] =
    dbConfig.db.run(
      instances.filter(_.expiresAt.isDefined).result
    )

  /** Counts one more reminder, unless the database was renewed or reminded since `instance` was read. Returns the
    * number of updated rows.
    */
  def incrementRemindersSent(instance: Instance): Future[Int] =
    dbConfig.db.run(
      instances
        .filter(i =>
          i.id === instance.id && i.remindersSent === instance.remindersSent && i.expiresAt === instance.expiresAt
        )
        .map(_.remindersSent)
        .update(instance.remindersSent + 1)
    )

  def deleteInstanceById(instanceId: InstanceId): Future[Int] =
    dbConfig.db.run(
      instances.filter(_.id === instanceId).delete
    )

  def countInstances(): Future[Int] =
    dbConfig.db.run(
      instances.length.result
    )
}
