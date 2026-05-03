package com.htwhub.ocean.serializers.auth

import play.api.data.Form
import play.api.data.Forms.mapping
import play.api.data.Forms.nonEmptyText
import play.api.libs.json.Json
import play.api.libs.json.OFormat

final case class RefreshTokenRequest(refreshToken: String)

object RefreshTokenRequest {
  implicit val refreshTokenRequestFormat: OFormat[RefreshTokenRequest] = Json.format[RefreshTokenRequest]
}

object RefreshTokenSerializer {
  val constraints: Form[RefreshTokenRequest] = Form(
    mapping(
      "refreshToken" -> nonEmptyText,
    )(RefreshTokenRequest.apply)(RefreshTokenRequest.unapply)
  )
}
