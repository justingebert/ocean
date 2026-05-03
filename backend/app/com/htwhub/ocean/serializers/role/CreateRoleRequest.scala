package com.htwhub.ocean.serializers.role

import com.htwhub.ocean.serializers.CustomConstraints
import play.api.data.Form
import play.api.data.Forms.longNumber
import play.api.data.Forms.mapping
import play.api.data.Forms.text
import play.api.libs.json.Json
import play.api.libs.json.OFormat

final case class CreateRoleRequest(instanceId: Long, roleName: String)

object CreateRoleRequest {
  implicit val createRoleFormat: OFormat[CreateRoleRequest] = Json.format[CreateRoleRequest]
}

object CreateRoleSerializer {
  val constraints: Form[CreateRoleRequest] = Form(
    mapping(
      "instanceId" -> longNumber,
      "roleName" -> text.verifying(CustomConstraints.nameCheckConstraint),
    )(CreateRoleRequest.apply)(CreateRoleRequest.unapply)
  )
}
