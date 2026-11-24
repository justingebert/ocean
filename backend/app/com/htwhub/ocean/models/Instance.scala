package com.htwhub.ocean.models

import com.htwhub.ocean.models.Instance.EngineType
import io.swagger.annotations.ApiModel
import io.swagger.annotations.ApiModelProperty
import java.sql.Timestamp
import play.api.libs.functional.syntax.toInvariantFunctorOps
import play.api.libs.json.Format
import play.api.libs.json.Json
import play.api.libs.json.JsonConfiguration
import play.api.libs.json.OFormat
import play.api.libs.json.OptionHandlers
import play.api.libs.json.Reads
import play.api.libs.json.Writes
import scala.annotation.meta.field
import slick.jdbc.PostgresProfile._
import slick.jdbc.PostgresProfile.api.longColumnType

@ApiModel("Instance")
final case class Instance(
  @(ApiModelProperty @field) id: InstanceId,
  @(ApiModelProperty @field) userId: UserId,
  @(ApiModelProperty @field) name: String,
  @(ApiModelProperty @field) engine: EngineType,
  @(ApiModelProperty @field) createdAt: Timestamp,
  @(ApiModelProperty @field) expiresAt: Option[Timestamp],
  @(ApiModelProperty @field) remindersSent: Int
)

object Instance {

  implicit val timestampReads: Reads[Timestamp] =
    implicitly[Reads[Long]].map(new Timestamp(_))

  implicit val timestampWrites: Writes[Timestamp] =
    implicitly[Writes[Long]].contramap(_.getTime)

  // WritesNull so `expiresAt` is sent as `null` (never expires) instead of being omitted.
  implicit lazy val instanceFormat: OFormat[Instance] =
    Json.configured(JsonConfiguration(optionHandlers = OptionHandlers.WritesNull)).format[Instance]

  type EngineType = String
  val PostgreSQLEngineType: EngineType = "P"
  val MongoDBSQLEngineType: EngineType = "M"
}

final case class InstanceId(value: Long) extends AnyVal

object InstanceId {
  implicit lazy val columnInstanceIdMapper = MappedColumnType.base[InstanceId, Long](_.value, InstanceId(_))
  implicit lazy val instanceIdFormat: Format[InstanceId] = implicitly[Format[Long]].inmap(InstanceId.apply, _.value)
}
