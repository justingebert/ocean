package com.htwhub.ocean.service

import com.htwhub.ocean.serializers.auth.AccessTokenContent
import com.htwhub.ocean.serializers.auth.AuthContent
import com.htwhub.ocean.serializers.auth.AuthResponse
import com.htwhub.ocean.serializers.auth.RefreshTokenContent
import javax.inject.Inject
import pdi.jwt.algorithms.JwtHmacAlgorithm
import pdi.jwt.Jwt
import pdi.jwt.JwtAlgorithm
import pdi.jwt.JwtClaim
import play.api.libs.json.Json
import play.api.Configuration
import play.api.Logger

class TokenService @Inject() (configuration: Configuration) {

  val logger: Logger = Logger(this.getClass)

  /** The signing key that is used to sign the content of generated tokens. */
  val SECRET_KEY: String = configuration.get[String]("jwt.secret_key")

  /** The algorithm which will be used to perform signing/verification operations on tokens. */
  val hmacAlgorithm: JwtHmacAlgorithm = JwtAlgorithm.HS256

  /** Specifies how long access tokens are valid. */
  val accessExpirationTimeInSeconds: Long = configuration.get[Long]("jwt.access_expiration_time")

  /** Specifies how long refresh tokens are valid. */
  val refreshExpirationTimeInSeconds: Long = configuration.get[Long]("jwt.refresh_expiration_time")

  /** Returns an access and refresh token. */
  def obtainTokens(
    accessTokenContent: AccessTokenContent,
    refreshTokenContent: RefreshTokenContent,
    currentTimestamp: Long
  ): AuthResponse = {
    val newAccessToken = getAuthToken(accessTokenContent, currentTimestamp, accessExpirationTimeInSeconds)
    val newRefreshToken = getAuthToken(refreshTokenContent, currentTimestamp, refreshExpirationTimeInSeconds)
    AuthResponse(newAccessToken, newRefreshToken)
  }

  /** Returns an access token created from this refresh token. */
  def refreshTokens(refreshToken: String, currentTimestamp: Long): Option[AuthResponse] =
    getOptJwtClaims(refreshToken)
      .filter(_.expiration.exists(_ > currentTimestamp))
      .map(claims => Json.parse(claims.content).as[AuthContent])
      .collect { case refreshTokenContent: RefreshTokenContent =>
        val accessTokenContent = AccessTokenContent(refreshTokenContent.userId)
        val newAccessToken = getAuthToken(accessTokenContent, currentTimestamp, accessExpirationTimeInSeconds)
        AuthResponse(newAccessToken, refreshToken)
      }

  def getAuthToken(authContent: AuthContent, currentTimestamp: Long, lifetime: Long): String = {
    val claims = JwtClaim(
      content = Json.stringify(Json.toJson(authContent)),
      expiration = Some(currentTimestamp + lifetime),
      issuedAt = Some(currentTimestamp)
    )
    Jwt.encode(claims, SECRET_KEY, hmacAlgorithm)
  }

  def getOptJwtClaims(jwt: String): Option[JwtClaim] =
    Jwt.decode(jwt, SECRET_KEY, Seq(hmacAlgorithm)).toOption
}
