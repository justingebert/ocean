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

@ApiModel("User")
final case class User(
  @(ApiModelProperty @field) id: UserId,
  @(ApiModelProperty @field) username: String,
  @(ApiModelProperty @field) firstName: String,
  @(ApiModelProperty @field) lastName: String,
  @(ApiModelProperty @field) mail: String,
  @(ApiModelProperty @field) employeeType: String
)

object User {
  implicit val userFormat: OFormat[User] = Json.format[User]
}

final case class UserId(value: Long) extends AnyVal

object UserId {
  implicit lazy val columnUserIdMapper = MappedColumnType.base[UserId,Long](_.value, UserId(_))
  implicit lazy val userIdFormat: Format[UserId] = implicitly[Format[Long]].inmap(UserId.apply, _.value)
}