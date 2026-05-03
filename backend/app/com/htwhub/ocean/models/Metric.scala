package com.htwhub.ocean.models

import io.swagger.annotations.ApiModel
import io.swagger.annotations.ApiModelProperty
import play.api.libs.json.Json
import play.api.libs.json.OFormat
import scala.annotation.meta.field

@ApiModel("Metric")
final case class Metric(
  @(ApiModelProperty @field) totalInstances: Long,
  @(ApiModelProperty @field) totalUsers: Long,
)

object Metric {
  implicit lazy val metricFormat: OFormat[Metric] = Json.format[Metric]
}
