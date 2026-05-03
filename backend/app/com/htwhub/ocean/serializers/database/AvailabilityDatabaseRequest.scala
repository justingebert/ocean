package com.htwhub.ocean.serializers.database

import com.htwhub.ocean.models.Instance.EngineType
import com.htwhub.ocean.serializers.CustomConstraints
import play.api.data.Form
import play.api.data.Forms.mapping
import play.api.data.Forms.nonEmptyText
import play.api.libs.json.Json
import play.api.libs.json.OFormat

final case class AvailabilityDatabaseRequest(name: String, engine: EngineType)

object AvailabilityDatabaseRequest {
  implicit val availabilityDatabaseRequestFormat: OFormat[AvailabilityDatabaseRequest] =
    Json.format[AvailabilityDatabaseRequest]
}

object AvailabilityDatabaseSerializer {
  val constraints: Form[AvailabilityDatabaseRequest] = Form(
    mapping(
      "name" -> nonEmptyText.verifying(CustomConstraints.nameCheckConstraint),
      "engine" -> nonEmptyText.verifying(CustomConstraints.engineCheckConstraint)
    )(AvailabilityDatabaseRequest.apply)(AvailabilityDatabaseRequest.unapply)
  )
}
