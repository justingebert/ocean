package com.htwhub.ocean.models

import io.swagger.annotations.ApiModel
import io.swagger.annotations.ApiModelProperty
import java.sql.Timestamp
import play.api.libs.functional.syntax.toInvariantFunctorOps
import play.api.libs.json.Format
import play.api.libs.json.Json
import play.api.libs.json.OFormat
import play.api.libs.json.Reads
import play.api.libs.json.Writes
import scala.annotation.meta.field
import slick.jdbc.PostgresProfile._
import slick.jdbc.PostgresProfile.api.longColumnType

@ApiModel("Invitation")
final case class Invitation(
  @(ApiModelProperty @field) id: InvitationId,
  @(ApiModelProperty @field) instanceId: InstanceId,
  @(ApiModelProperty @field) userId: UserId,
  @(ApiModelProperty @field) createdAt: Timestamp
)

object Invitation {

  implicit val timestampReads: Reads[Timestamp] =
    implicitly[Reads[Long]].map(new Timestamp(_))

  implicit val timestampWrites: Writes[Timestamp] =
    implicitly[Writes[Long]].contramap(_.getTime)

  implicit lazy val invitationFormat: OFormat[Invitation] = Json.format[Invitation]
}

final case class InvitationId(value: Long) extends AnyVal

object InvitationId {
  implicit lazy val columnInvitationIdMapper = MappedColumnType.base[InvitationId, Long](_.value, InvitationId(_))
  implicit lazy val invitationIdFormat: Format[InvitationId] =
    implicitly[Format[Long]].inmap(InvitationId.apply, _.value)
}
