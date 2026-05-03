package com.htwhub.ocean.serializers.role

import play.api.libs.json.Json
import play.api.libs.json.OFormat

final case class AvailabilityRoleResponse(availability: Boolean)

object AvailabilityRoleResponse {
  implicit val availabilityRoleResponseFormat: OFormat[AvailabilityRoleResponse] =
    Json.format[AvailabilityRoleResponse]
}
