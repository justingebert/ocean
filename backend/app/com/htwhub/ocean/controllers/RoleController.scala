package com.htwhub.ocean.controllers

import com.htwhub.ocean.actions.UserAction
import com.htwhub.ocean.actions.UserRequest
import com.htwhub.ocean.managers.RoleManager
import com.htwhub.ocean.managers.RoleManager.Exceptions.RoleManagerException
import com.htwhub.ocean.models.InstanceId
import com.htwhub.ocean.models.Role
import com.htwhub.ocean.models.RoleId
import com.htwhub.ocean.serializers.role.AvailabilityRoleRequest
import com.htwhub.ocean.serializers.role.AvailabilityRoleResponse
import com.htwhub.ocean.serializers.role.AvailabilityRoleSerializer
import com.htwhub.ocean.serializers.role.CreateRoleRequest
import com.htwhub.ocean.serializers.role.CreateRoleSerializer
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

@Api(value = "Role")
class RoleController @Inject() (cc: ControllerComponents, userAction: UserAction, roleManager: RoleManager)(implicit
  executionContext: ExecutionContext
) extends AbstractController(cc) {

  val logger: Logger = Logger(this.getClass)

  implicit val messages: Messages = messagesApi.preferred(Seq(Lang.defaultLang))

  @ApiOperation(
    value = "Get Database Roles",
    notes = "Get roles for a single database.",
    httpMethod = "GET",
    response = classOf[Role],
    responseContainer = "List"
  )
  @ApiResponses(
    value = Array(
      new ApiResponse(code = 400, message = "Invalid ID supplied", response = classOf[String]),
      new ApiResponse(code = 403, message = "Forbidden", response = classOf[String])
    )
  )
  def getRolesByInstanceId(
    @ApiParam(value = "ID of database that needs to be fetched", required = true) instanceId: Long
  ): Action[AnyContent] = userAction.async { implicit request: UserRequest[AnyContent] =>
    roleManager
      .getRolesByInstanceId(InstanceId(instanceId), request.user)
      .map(roles => Ok(Json.toJson(roles)))
      .recoverWith { case e: RoleManagerException => exceptionToResult(e) }
  }

  @ApiOperation(
    value = "Get Role availability",
    notes = "Get availability information for a single role.",
    httpMethod = "POST",
    response = classOf[Role]
  )
  @ApiImplicitParams(
    Array(
      new ApiImplicitParam(
        value = "Role availability request",
        required = true,
        dataTypeClass = classOf[AvailabilityRoleRequest],
        paramType = "body"
      )
    )
  )
  @ApiResponses(value = Array(new ApiResponse(code = 400, message = "InternalError", response = classOf[String])))
  def getRoleAvailability: Action[AnyContent] = userAction.async { implicit request: UserRequest[AnyContent] =>
    processAvailabilityRoleRequest()
  }

  def processAvailabilityRoleRequest[A]()(implicit request: UserRequest[A]): Future[Result] = {

    def failure(badForm: Form[AvailabilityRoleRequest]): Future[Result] =
      Future.successful(BadRequest(badForm.errorsAsJson))

    def success(availableRoleRequest: AvailabilityRoleRequest): Future[Result] =
      roleManager
        .getRoleAvailability(availableRoleRequest)
        .map(response => Ok(Json.toJson(AvailabilityRoleResponse(response))))
        .recoverWith { case e: RoleManagerException => exceptionToResult(e) }

    AvailabilityRoleSerializer.constraints.bindFromRequest().fold(failure, success)
  }

  @ApiOperation(
    value = "Create Role",
    notes = "Create a single role.",
    httpMethod = "POST",
    response = classOf[Role]
  )
  @ApiImplicitParams(
    Array(
      new ApiImplicitParam(
        value = "Create role request",
        required = true,
        dataTypeClass = classOf[CreateRoleRequest],
        paramType = "body"
      )
    )
  )
  @ApiResponses(
    value = Array(
      new ApiResponse(code = 400, message = "Invalid ID supplied", response = classOf[String]),
      new ApiResponse(code = 403, message = "Forbidden", response = classOf[String])
    )
  )
  def addRole(): Action[AnyContent] = userAction.async { implicit request: UserRequest[AnyContent] =>
    processCreateRoleRequest()
  }

  def processCreateRoleRequest[A]()(implicit request: UserRequest[A]): Future[Result] = {

    def failure(badForm: Form[CreateRoleRequest]): Future[Result] =
      Future.successful(BadRequest(badForm.errorsAsJson))

    def success(createRoleRequest: CreateRoleRequest): Future[Result] =
      roleManager
        .addRole(createRoleRequest, request.user)
        .map(response => Ok(Json.toJson(response)))
        .recoverWith { case e: RoleManagerException => exceptionToResult(e) }

    CreateRoleSerializer.constraints.bindFromRequest().fold(failure, success)
  }

  @ApiOperation(
    value = "Delete Role",
    notes = "Delete a single role.",
    httpMethod = "DELETE",
    response = classOf[String]
  )
  @ApiResponses(
    value = Array(
      new ApiResponse(code = 400, message = "Invalid ID supplied", response = classOf[String]),
      new ApiResponse(code = 403, message = "Forbidden", response = classOf[String])
    )
  )
  def deleteRole(
    @ApiParam(value = "ID of role that needs to be deleted", required = true) id: Long
  ): Action[AnyContent] = userAction.async { implicit request: UserRequest[AnyContent] =>
    roleManager
      .deleteRoleById(RoleId(id), request.user)
      .map(_ => Ok(""))
      .recoverWith { case e: RoleManagerException => exceptionToResult(e) }
  }

  def exceptionToResult(e: RoleManagerException): Future[Result] = e match {
    case _: RoleManager.Exceptions.NotFound      => Future.successful(NotFound(e.getMessage))
    case _: RoleManager.Exceptions.AccessDenied  => Future.successful(Forbidden(e.getMessage))
    case _: RoleManager.Exceptions.InternalError => Future.successful(BadRequest(e.getMessage))
  }
}
