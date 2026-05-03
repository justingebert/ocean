package com.htwhub.ocean.serializers.auth

import play.api.libs.json.Json
import play.api.libs.json.OFormat

final case class AuthResponse(accessToken: String, refreshToken: String)

object AuthResponse {
  implicit val authResponseFormat: OFormat[AuthResponse] = Json.format[AuthResponse]
}
