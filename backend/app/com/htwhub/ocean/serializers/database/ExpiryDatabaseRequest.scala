package com.htwhub.ocean.serializers.database

import play.api.data.Form
import play.api.data.Forms.boolean
import play.api.data.Forms.mapping
import play.api.libs.json.Json
import play.api.libs.json.OFormat

final case class ExpiryDatabaseRequest(neverExpires: Boolean)

object ExpiryDatabaseRequest {
  implicit val expiryDatabaseRequestFormat: OFormat[ExpiryDatabaseRequest] = Json.format[ExpiryDatabaseRequest]
}

object ExpiryDatabaseSerializer {
  val constraints: Form[ExpiryDatabaseRequest] = Form(
    mapping(
      "neverExpires" -> boolean
    )(ExpiryDatabaseRequest.apply)(ExpiryDatabaseRequest.unapply)
  )
}
