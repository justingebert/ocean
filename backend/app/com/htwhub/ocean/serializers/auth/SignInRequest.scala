package com.htwhub.ocean.serializers.auth

import play.api.data._
import play.api.data.Forms._
import play.api.libs.json.Json
import play.api.libs.json.OFormat

final case class SignInRequest(username: String, password: String)

object SignInRequest {
  implicit val signInRequestFormat: OFormat[SignInRequest] = Json.format[SignInRequest]
}

object SignInSerializer {
  val constraints: Form[SignInRequest] = Form(
    mapping(
      "username" -> nonEmptyText,
      "password" -> nonEmptyText
    )(SignInRequest.apply)(SignInRequest.unapply)
  )
}
