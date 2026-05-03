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
    def * = (id, userId, name, engine, createdAt) <> ((Instance.apply _).tupled, Instance.unapply)
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

  def deleteInstanceById(instanceId: InstanceId): Future[Int] =
    dbConfig.db.run(
      instances.filter(_.id === instanceId).delete
    )

  def countInstances(): Future[Int] =
    dbConfig.db.run(
      instances.length.result
    )
}
