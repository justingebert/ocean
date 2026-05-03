package com.htwhub.ocean.repositories

import com.htwhub.ocean.models.InstanceId
import com.htwhub.ocean.models.Invitation
import com.htwhub.ocean.models.InvitationId
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
class InvitationRepository @Inject() (
  dbConfigProvider: DatabaseConfigProvider,
  instanceRepository: InstanceRepository,
  userRepository: UserRepository
)(implicit ec: ExecutionContext) {

  protected val dbConfig = dbConfigProvider.get[JdbcProfile]

  import dbConfig._
  import profile.api._

  class InvitationTable(tag: Tag) extends Table[Invitation](tag, "invitations") {

    def id = column[InvitationId]("id", O.PrimaryKey, O.AutoInc)
    def instanceId = column[InstanceId]("instance_id")
    def userId = column[UserId]("user_id")
    def createdAt = column[Timestamp](
      "created_at",
      SqlType("timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP")
    )
    def * =
      (id, instanceId, userId, createdAt) <> ((Invitation.apply _).tupled, Invitation.unapply)
    def idx = index("idx_instanceId_userId", (instanceId, userId), unique = true)
    // TODO: fix Compilation error[private value userRepository escapes its defining scope
    foreignKey("fk_invitation_instance", instanceId, TableQuery[instanceRepository.InstanceTable])(
      _.id,
      onDelete = ForeignKeyAction.SetNull
    )
    foreignKey("fk_invitation_user", userId, TableQuery[userRepository.UserTable])(
      _.id,
      onDelete = ForeignKeyAction.SetNull
    )
  }

  protected val invitations = TableQuery[InvitationTable]

  def getInvitationsByInstanceId(instanceId: InstanceId): Future[Seq[Invitation]] =
    dbConfig.db.run(
      invitations.filter(_.instanceId === instanceId).result
    )

  def getInvitationById(invitationId: InvitationId): Future[Option[Invitation]] =
    dbConfig.db.run(
      invitations.filter(_.id === invitationId).result.headOption
    )

  def addInvitation(invitation: Invitation): Future[InvitationId] =
    dbConfig.db.run(
      invitations.returning(invitations.map(_.id)) += invitation
    )

  def deleteInvitationById(invitationId: InvitationId): Future[Int] =
    dbConfig.db.run(
      invitations.filter(_.id === invitationId).delete
    )
}
