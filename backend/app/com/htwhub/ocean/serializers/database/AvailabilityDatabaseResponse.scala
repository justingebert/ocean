package com.htwhub.ocean.serializers.database

import play.api.libs.json.Json
import play.api.libs.json.OFormat

final case class AvailabilityDatabaseResponse(availability: Boolean)

object AvailabilityDatabaseResponse {
  implicit val availabilityDatabaseResponseFormat: OFormat[AvailabilityDatabaseResponse] =
    Json.format[AvailabilityDatabaseResponse]
}
