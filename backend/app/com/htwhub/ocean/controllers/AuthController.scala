package com.htwhub.ocean.controllers

import com.htwhub.ocean.managers.AuthManager
import com.htwhub.ocean.managers.AuthManager.Exceptions.AuthManagerException
import com.htwhub.ocean.serializers.auth.AuthResponse
import com.htwhub.ocean.serializers.auth.RefreshTokenRequest
import com.htwhub.ocean.serializers.auth.RefreshTokenSerializer
import com.htwhub.ocean.serializers.auth.SignInRequest
import com.htwhub.ocean.serializers.auth.SignInSerializer
import io.swagger.annotations.Api
import io.swagger.annotations.ApiImplicitParam
import io.swagger.annotations.ApiImplicitParams
import io.swagger.annotations.ApiOperation
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
import play.api.mvc.Request
import play.api.mvc.Result
import play.api.Logger
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

@Api(value = "Authorization")
class AuthController @Inject() (cc: ControllerComponents, authManager: AuthManager)(implicit
  ec: ExecutionContext
) extends AbstractController(cc) {

  val logger: Logger = Logger(this.getClass)

  implicit val messages: Messages = messagesApi.preferred(Seq(Lang.defaultLang))

  @ApiOperation(
    value = "Sign In",
    notes = "Sign in and retrieve an access token.",
    httpMethod = "POST",
    response = classOf[AuthResponse]
  )
  @ApiImplicitParams(
    Array(
      new ApiImplicitParam(
        value = "Sign in request",
        required = true,
        dataTypeClass = classOf[SignInRequest],
        paramType = "body"
      )
    )
  )
  @ApiResponses(
    value = Array(
      new ApiResponse(code = 400, message = "InternalError", response = classOf[String]),
      new ApiResponse(code = 403, message = "Forbidden", response = classOf[String])
    )
  )
  def signIn: Action[AnyContent] = Action.async { implicit request: Request[AnyContent] =>
    processSignInRequest()
  }

  private def processSignInRequest[A]()(implicit request: Request[A]): Future[Result] = {

    def failure(badForm: Form[SignInRequest]): Future[Result] =
      Future.successful(BadRequest(badForm.errorsAsJson))

    def success(signInRequest: SignInRequest): Future[Result] =
      authManager
        .signIn(signInRequest)
        .map(response => Ok(Json.toJson(response)))
        .recoverWith { case e: AuthManagerException => exceptionToResult(e) }

    SignInSerializer.constraints.bindFromRequest().fold(failure, success)
  }

  @ApiOperation(
    value = "Refresh Token",
    notes = "Retrieve an updated access token.",
    httpMethod = "POST",
    response = classOf[AuthResponse]
  )
  @ApiImplicitParams(
    Array(
      new ApiImplicitParam(
        value = "Refresh token request",
        required = true,
        dataTypeClass = classOf[RefreshTokenRequest],
        paramType = "body"
      )
    )
  )
  @ApiResponses(
    value = Array(
      new ApiResponse(code = 400, message = "InternalError", response = classOf[String]),
      new ApiResponse(code = 403, message = "Forbidden", response = classOf[String])
    )
  )
  def refreshToken: Action[AnyContent] = Action.async { implicit request: Request[AnyContent] =>
    processRefreshTokenRequest()
  }

  private def processRefreshTokenRequest[A]()(implicit request: Request[A]): Future[Result] = {

    def failure(badForm: Form[RefreshTokenRequest]): Future[Result] =
      Future.successful(BadRequest(badForm.errorsAsJson))

    def success(refreshTokenRequest: RefreshTokenRequest): Future[Result] =
      authManager
        .refreshToken(refreshTokenRequest)
        .map(response => Ok(Json.toJson(response)))
        .recoverWith { case e: AuthManagerException => exceptionToResult(e) }

    RefreshTokenSerializer.constraints.bindFromRequest().fold(failure, success)
  }

  def exceptionToResult(e: AuthManagerException): Future[Result] = e match {
    case _: AuthManager.Exceptions.AccessDenied  => Future.successful(Forbidden(e.getMessage))
    case _: AuthManager.Exceptions.InternalError => Future.successful(BadRequest(e.getMessage))
  }
}
