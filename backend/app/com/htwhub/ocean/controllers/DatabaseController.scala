package com.htwhub.ocean.controllers

import com.htwhub.ocean.actions.UserAction
import com.htwhub.ocean.actions.UserRequest
import com.htwhub.ocean.managers.DatabaseManager
import com.htwhub.ocean.managers.DatabaseManager.Exceptions.DatabaseManagerException
import com.htwhub.ocean.models.Instance
import com.htwhub.ocean.models.InstanceId
import com.htwhub.ocean.serializers.database.AvailabilityDatabaseRequest
import com.htwhub.ocean.serializers.database.AvailabilityDatabaseResponse
import com.htwhub.ocean.serializers.database.AvailabilityDatabaseSerializer
import com.htwhub.ocean.serializers.database.CreateDatabaseRequest
import com.htwhub.ocean.serializers.database.CreateDatabaseSerializer
import io.swagger.annotations.Api
import io.swagger.annotations.ApiImplicitParam
import io.swagger.annotations.ApiImplicitParams
import io.swagger.annotations.ApiOperation
import io.swagger.annotations.ApiParam
import io.swagger.annotations.ApiResponse
import io.swagger.annotations.ApiResponses
import javax.inject.Inject
import play.api.data.Form
import play.api.i18n.Lang
import play.api.i18n.Messages
import play.api.libs.json.Json
import play.api.mvc.AbstractController
import play.api.mvc.Action
import play.api.mvc.AnyContent
import play.api.mvc.ControllerComponents
import play.api.mvc.Result
import play.api.Logger
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

@Api(value = "Database")
class DatabaseController @Inject() (cc: ControllerComponents, userAction: UserAction, databaseManager: DatabaseManager)(
  implicit executionContext: ExecutionContext
) extends AbstractController(cc) {

  val logger: Logger = Logger(this.getClass)

  implicit val messages: Messages = messagesApi.preferred(Seq(Lang.defaultLang))

  @ApiOperation(
    value = "Get all Databases from all Users",
    notes = "Get information for multiple databases only with permissio.",
    httpMethod = "GET",
    response = classOf[Instance],
    responseContainer = "List"
  )
  @ApiResponses(
    value = Array(
      new ApiResponse(code = 400, message = "InternalError", response = classOf[String]),
      new ApiResponse(code = 403, message = "Forbidden", response = classOf[String]),
    )
  )
  def getAllDatabases: Action[AnyContent] = userAction.async { implicit request: UserRequest[AnyContent] =>
    databaseManager
      .getAllInstances(request.user)
      .map(instances => Ok(Json.toJson(instances)))
      .recoverWith { case e: DatabaseManagerException => exceptionToResult(e) }
  }

  @ApiOperation(
    value = "Get Databases",
    notes = "Get information for multiple databases.",
    httpMethod = "GET",
    response = classOf[Instance],
    responseContainer = "List"
  )
  @ApiResponses(value = Array(new ApiResponse(code = 400, message = "InternalError", response = classOf[String])))
  def getDatabases: Action[AnyContent] = userAction.async { implicit request: UserRequest[AnyContent] =>
    databaseManager
      .getUserInstances(request.user)
      .map(instances => Ok(Json.toJson(instances)))
      .recoverWith { case e: DatabaseManagerException => exceptionToResult(e) }
  }

  @ApiOperation(
    value = "Get Database",
    notes = "Get information for a single database identified by their unique ID.",
    httpMethod = "GET",
    response = classOf[Instance]
  )
  @ApiResponses(
    value = Array(
      new ApiResponse(code = 400, message = "InternalError", response = classOf[String]),
      new ApiResponse(code = 403, message = "Forbidden", response = classOf[String]),
      new ApiResponse(code = 404, message = "Invalid ID supplied", response = classOf[String])
    )
  )
  def getDatabaseById(
    @ApiParam(value = "ID of database that needs to be fetched", required = true) id: Long
  ): Action[AnyContent] = userAction.async { implicit request: UserRequest[AnyContent] =>
    databaseManager
      .getUserInstanceById(InstanceId(id), request.user)
      .map(instance => Ok(Json.toJson(instance)))
      .recoverWith { case e: DatabaseManagerException => exceptionToResult(e) }
  }

  @ApiOperation(
    value = "Get Database availability",
    notes = "Get availability information for a single database.",
    httpMethod = "POST",
    response = classOf[AvailabilityDatabaseResponse]
  )
  @ApiImplicitParams(
    Array(
      new ApiImplicitParam(
        value = "Database availability request",
        required = true,
        dataTypeClass = classOf[AvailabilityDatabaseRequest],
        paramType = "body"
      )
    )
  )
  @ApiResponses(value = Array(new ApiResponse(code = 400, message = "InternalError", response = classOf[String])))
  def getDatabaseAvailability: Action[AnyContent] = userAction.async { implicit request: UserRequest[AnyContent] =>
    processAvailabilityDatabaseRequest()
  }

  def processAvailabilityDatabaseRequest[A]()(implicit request: UserRequest[A]): Future[Result] = {

    def failure(badForm: Form[AvailabilityDatabaseRequest]): Future[Result] =
      Future.successful(BadRequest(badForm.errorsAsJson))

    def success(availability: AvailabilityDatabaseRequest): Future[Result] =
      databaseManager
        .getInstanceAvailability(availability)
        .map(response => Ok(Json.toJson(AvailabilityDatabaseResponse(response))))
        .recoverWith { case e: DatabaseManagerException => exceptionToResult(e) }

    AvailabilityDatabaseSerializer.constraints.bindFromRequest().fold(failure, success)
  }

  @ApiOperation(
    value = "Create Database",
    notes = "Create a single database.",
    httpMethod = "POST",
    response = classOf[Instance]
  )
  @ApiImplicitParams(
    Array(
      new ApiImplicitParam(
        value = "Create database request",
        required = true,
        dataTypeClass = classOf[CreateDatabaseRequest],
        paramType = "body"
      )
    )
  )
  @ApiResponses(value = Array(new ApiResponse(code = 400, message = "InternalError", response = classOf[String])))
  def addDatabase(): Action[AnyContent] = userAction.async { implicit request: UserRequest[AnyContent] =>
    processCreateDatabaseRequest()
  }

  def processCreateDatabaseRequest[A]()(implicit request: UserRequest[A]): Future[Result] = {

    def failure(badForm: Form[CreateDatabaseRequest]): Future[Result] =
      Future.successful(BadRequest(badForm.errorsAsJson))

    def success(createDatabaseRequest: CreateDatabaseRequest): Future[Result] =
      databaseManager
        .addDatabase(createDatabaseRequest, request.user)
        .map(response => Ok(Json.toJson(response)))
        .recoverWith { case e: DatabaseManagerException => exceptionToResult(e) }

    CreateDatabaseSerializer.constraints.bindFromRequest().fold(failure, success)
  }

  @ApiOperation(
    value = "Delete Database",
    notes = "Delete a single database.",
    httpMethod = "DELETE",
    response = classOf[String]
  )
  @ApiResponses(
    value = Array(
      new ApiResponse(code = 400, message = "InternalError", response = classOf[String]),
      new ApiResponse(code = 403, message = "Forbidden", response = classOf[String]),
      new ApiResponse(code = 404, message = "Invalid ID supplied", response = classOf[String])
    )
  )
  def deleteDatabase(
    @ApiParam(value = "ID of database that needs to be deleted", required = true) id: Long
  ): Action[AnyContent] = userAction.async { implicit request: UserRequest[AnyContent] =>
    databaseManager
      .deleteDatabase(InstanceId(id), request.user)
      .map(_ => Ok(""))
      .recoverWith { case e: DatabaseManagerException => exceptionToResult(e) }
  }

  @ApiOperation(
    value = "Delete Database",
    notes = "Delete a single database.",
    httpMethod = "DELETE",
    response = classOf[String]
  )
  @ApiResponses(
    value = Array(
      new ApiResponse(code = 400, message = "InternalError", response = classOf[String]),
      new ApiResponse(code = 403, message = "Forbidden", response = classOf[String]),
      new ApiResponse(code = 404, message = "Invalid ID supplied", response = classOf[String])
    )
  )
  def deleteDatabaseWithPermission(
    @ApiParam(value = "ID of database that needs to be deleted", required = true) id: Long
  ): Action[AnyContent] = userAction.async { implicit request: UserRequest[AnyContent] =>
    databaseManager
      .deleteDatabaseWithPermission(InstanceId(id), request.user)
      .map(_ => Ok(""))
      .recoverWith { case e: DatabaseManagerException => exceptionToResult(e) }
  }

  def exceptionToResult(e: DatabaseManagerException): Future[Result] = e match {
    case _: DatabaseManager.Exceptions.NotFound      => Future.successful(NotFound(e.getMessage))
    case _: DatabaseManager.Exceptions.AccessDenied  => Future.successful(Forbidden(e.getMessage))
    case _: DatabaseManager.Exceptions.InternalError => Future.successful(BadRequest(e.getMessage))
  }
}
