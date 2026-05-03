package com.htwhub.ocean.serializers.role

import com.htwhub.ocean.serializers.CustomConstraints
import play.api.data.Form
import play.api.data.Forms.longNumber
import play.api.data.Forms.mapping
import play.api.data.Forms.nonEmptyText
import play.api.libs.json.Json
import play.api.libs.json.OFormat

final case class AvailabilityRoleRequest(instanceId: Long, roleName: String)

object AvailabilityRoleRequest {
  implicit val availabilityRoleRequestFormat: OFormat[AvailabilityRoleRequest] =
    Json.format[AvailabilityRoleRequest]
}

object AvailabilityRoleSerializer {
  val constraints: Form[AvailabilityRoleRequest] = Form(
    mapping(
      "instanceId" -> longNumber,
      "roleName" -> nonEmptyText.verifying(CustomConstraints.nameCheckConstraint),
    )(AvailabilityRoleRequest.apply)(AvailabilityRoleRequest.unapply)
  )
}
