package com.htwhub.ocean.repositories

import com.htwhub.ocean.models.InstanceId
import com.htwhub.ocean.models.Role
import com.htwhub.ocean.models.RoleId
import javax.inject.Inject
import javax.inject.Singleton
import play.api.db.slick.DatabaseConfigProvider
import scala.concurrent.ExecutionContext
import scala.concurrent.Future
import slick.jdbc.JdbcProfile

@Singleton
class RoleRepository @Inject() (dbConfigProvider: DatabaseConfigProvider, instanceRepository: InstanceRepository)(
  implicit ec: ExecutionContext
) {

  protected val dbConfig = dbConfigProvider.get[JdbcProfile]

  import dbConfig._
  import profile.api._

  class RoleTable(tag: Tag) extends Table[Role](tag, "roles") {

    def id = column[RoleId]("id", O.PrimaryKey, O.AutoInc)
    def instanceId = column[InstanceId]("instance_id")
    def name = column[String]("name")
    def password = column[String]("password")
    def * = (id, instanceId, name, password) <> ((Role.apply _).tupled, Role.unapply)
    def idx_instanceId_name = index("idx_instanceId_name", (instanceId, name), unique = true)
    // TODO: fix Compilation error[private value userRepository escapes its defining scope
    foreignKey("fk_role_instance", instanceId, TableQuery[instanceRepository.InstanceTable])(
      _.id,
      onDelete = ForeignKeyAction.Cascade
    )
  }

  protected val roles = TableQuery[RoleTable]

  def getRolesByInstanceId(instanceId: InstanceId): Future[Seq[Role]] =
    dbConfig.db.run(
      roles.filter(_.instanceId === instanceId).result
    )

  def getRolesByName(roleName: String): Future[Seq[Role]] =
    dbConfig.db.run(
      roles.filter(_.name === roleName).result
    )

  def getRoleById(roleId: RoleId): Future[Option[Role]] =
    dbConfig.db.run(
      roles.filter(_.id === roleId).result.headOption
    )

  def addRole(role: Role): Future[RoleId] =
    dbConfig.db.run(
      roles.returning(roles.map(_.id)) += role
    )

  def deleteRoleById(roleId: RoleId): Future[Int] =
    dbConfig.db.run(
      roles.filter(_.id === roleId).delete
    )

  def deleteRolesByInstanceId(instanceId: InstanceId): Future[Int] =
    dbConfig.db.run(
      roles.filter(_.instanceId === instanceId).delete
    )
}
