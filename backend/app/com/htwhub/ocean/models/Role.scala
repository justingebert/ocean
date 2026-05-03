package com.htwhub.ocean.models

import io.swagger.annotations.ApiModel
import io.swagger.annotations.ApiModelProperty
import play.api.libs.functional.syntax.toInvariantFunctorOps
import play.api.libs.json.Format
import play.api.libs.json.Json
import play.api.libs.json.OFormat
import scala.annotation.meta.field
import slick.jdbc.PostgresProfile._
import slick.jdbc.PostgresProfile.api.longColumnType

@ApiModel("Role")
final case class Role(
  @(ApiModelProperty @field) id: RoleId,
  @(ApiModelProperty @field) instanceId: InstanceId,
  @(ApiModelProperty @field) name: String,
  @(ApiModelProperty @field) password: String
)


object Role {
  implicit lazy val roleFormat: OFormat[Role] = Json.format[Role]

}

final case class RoleId(value: Long) extends AnyVal
object RoleId {
  implicit lazy val columnRoleIdMapper = MappedColumnType.base[RoleId,Long](_.value, RoleId(_))
  implicit lazy val roleIdFormat: Format[RoleId] = implicitly[Format[Long]].inmap(RoleId.apply, _.value)
}

/*
final case class RoleId(value: Long) extends MappedTo[Long]

object RoleId {
  implicit lazy val roleIdFormat: Format[RoleId] = implicitly[Format[Long]].inmap(RoleId.apply, _.value)
}
*/