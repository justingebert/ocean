package com.htwhub.ocean.controllers

import com.htwhub.ocean.actions.UserAction
import com.htwhub.ocean.actions.UserRequest
import com.htwhub.ocean.managers.InvitationManager
import com.htwhub.ocean.managers.InvitationManager.Exceptions.InvitationManagerException
import com.htwhub.ocean.models.InstanceId
import com.htwhub.ocean.models.Invitation
import com.htwhub.ocean.models.InvitationId
import com.htwhub.ocean.serializers.invitation.CreateInvitationRequest
import com.htwhub.ocean.serializers.invitation.CreateInvitationSerializer
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

@Api(value = "Invitation")
class InvitationController @Inject() (
  cc: ControllerComponents,
  userAction: UserAction,
  invitationManager: InvitationManager
)(implicit
  executionContext: ExecutionContext
) extends AbstractController(cc) {

  val logger: Logger = Logger(this.getClass)

  implicit val messages: Messages = messagesApi.preferred(Seq(Lang.defaultLang))

  @ApiOperation(
    value = "Get Database Invitations",
    notes = "Get invitations for a single database.",
    httpMethod = "GET",
    response = classOf[Invitation],
    responseContainer = "List"
  )
  @ApiResponses(
    value = Array(
      new ApiResponse(code = 400, message = "Invalid ID supplied", response = classOf[String]),
      new ApiResponse(code = 403, message = "Forbidden", response = classOf[String])
    )
  )
  def getInvitationsByInstanceId(instanceId: Long): Action[AnyContent] = userAction.async {
    implicit request: UserRequest[AnyContent] =>
      invitationManager
        .getInvitationsByInstanceId(InstanceId(instanceId), request.user)
        .map(invitations => Ok(Json.toJson(invitations)))
        .recoverWith { case e: InvitationManagerException => exceptionToResult(e) }
  }

  @ApiOperation(
    value = "Create Invitation",
    notes = "Create a single invitation.",
    httpMethod = "POST",
    response = classOf[Invitation]
  )
  @ApiImplicitParams(
    Array(
      new ApiImplicitParam(
        value = "Create invitation request",
        required = true,
        dataTypeClass = classOf[CreateInvitationRequest],
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
  def addInvitation(): Action[AnyContent] = userAction.async { implicit request: UserRequest[AnyContent] =>
    processCreateInvitationRequest()
  }

  def processCreateInvitationRequest[A]()(implicit request: UserRequest[A]): Future[Result] = {

    def failure(badForm: Form[CreateInvitationRequest]): Future[Result] =
      Future.successful(BadRequest(badForm.errorsAsJson))

    def success(createInvitationRequest: CreateInvitationRequest): Future[Result] =
      invitationManager
        .addInvitation(createInvitationRequest, request.user)
        .map(response => Ok(Json.toJson(response)))
        .recoverWith { case e: InvitationManagerException => exceptionToResult(e) }

    CreateInvitationSerializer.constraints.bindFromRequest().fold(failure, success)
  }

  @ApiOperation(
    value = "Delete Invitation",
    notes = "Delete a single invitation.",
    httpMethod = "DELETE",
    response = classOf[String]
  )
  @ApiResponses(
    value = Array(
      new ApiResponse(code = 400, message = "Invalid ID supplied", response = classOf[String]),
      new ApiResponse(code = 403, message = "Forbidden", response = classOf[String])
    )
  )
  def deleteInvitation(
    @ApiParam(value = "ID of invitation that needs to be deleted", required = true) id: Long
  ): Action[AnyContent] = userAction.async { implicit request: UserRequest[AnyContent] =>
    invitationManager
      .deleteInvitationById(InvitationId(id), request.user)
      .map(_ => Ok(""))
      .recoverWith { case e: InvitationManagerException => exceptionToResult(e) }
  }

  def exceptionToResult(e: InvitationManagerException): Future[Result] = e match {
    case _: InvitationManager.Exceptions.NotFound      => Future.successful(NotFound(e.getMessage))
    case _: InvitationManager.Exceptions.AccessDenied  => Future.successful(Forbidden(e.getMessage))
    case _: InvitationManager.Exceptions.InternalError => Future.successful(BadRequest(e.getMessage))
  }
}
