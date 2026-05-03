package com.htwhub.ocean.serializers.invitation

import play.api.data.Form
import play.api.data.Forms._
import play.api.libs.json.Json
import play.api.libs.json.OFormat

case class CreateInvitationRequest(instanceId: Long, userId: Long)

object CreateInvitationRequest {
  implicit val createInvitationFormat: OFormat[CreateInvitationRequest] = Json.format[CreateInvitationRequest]
}

object CreateInvitationSerializer {
  val constraints: Form[CreateInvitationRequest] = Form(
    mapping(
      "instanceId" -> longNumber,
      "userId" -> longNumber
    )(CreateInvitationRequest.apply)(CreateInvitationRequest.unapply)
  )
}
