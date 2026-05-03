package com.htwhub.ocean.controllers

import com.htwhub.ocean.actions.UserAction
import com.htwhub.ocean.actions.UserRequest
import com.htwhub.ocean.models.Metric
import com.htwhub.ocean.service
import com.htwhub.ocean.service.MetricService
import com.htwhub.ocean.service.MetricService.Exceptions.MetricServiceException
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import javax.inject.Inject
import play.api.libs.json.Json
import play.api.mvc.AbstractController
import play.api.mvc.Action
import play.api.mvc.AnyContent
import play.api.mvc.ControllerComponents
import play.api.mvc.Result
import play.api.Logger
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

@Api(value = "Metric")
class MetricController @Inject() (cc: ControllerComponents, userAction: UserAction, metricService: MetricService)(
  implicit executionContext: ExecutionContext
) extends AbstractController(cc) {

  val logger: Logger = Logger(this.getClass)

  @ApiOperation(
    value = "Get Metrics",
    notes = "Count databases and users.",
    httpMethod = "GET",
    response = classOf[Metric],
  )
  def getMetrics: Action[AnyContent] = userAction.async { implicit request: UserRequest[AnyContent] =>
    metricService
      .getMetrics(request.user)
      .map(metric => Ok(Json.toJson(metric)))
      .recoverWith { case e: MetricServiceException => exceptionToResult(e) }
  }

  def exceptionToResult(e: MetricServiceException): Future[Result] = e match {
    case _: service.MetricService.Exceptions.AccessDenied => Future.successful(Forbidden(e.getMessage))
    case _                                                => Future.successful(BadRequest(e.getMessage))
  }
}
