package com.htwhub.ocean.service

import com.htwhub.ocean.models.UserId
import com.htwhub.ocean.serializers.auth.AccessTokenContent
import com.htwhub.ocean.serializers.auth.AuthResponse
import com.htwhub.ocean.serializers.auth.RefreshTokenContent
import com.typesafe.config.Config
import com.typesafe.config.ConfigFactory
import java.io.File
import java.time.Instant
import org.scalatest.Assertion
import org.scalatest.Matchers
import org.scalatest.WordSpec
import org.scalatestplus.mockito.MockitoSugar
import pdi.jwt.algorithms.JwtHmacAlgorithm
import pdi.jwt.Jwt
import play.api.libs.json.Json
import play.api.Configuration

class TokenServiceSpec extends WordSpec with Matchers with MockitoSugar {

  val myConfigFile = new File("conf/application.test.conf")
  val parsedConfig: Config = ConfigFactory.parseFile(myConfigFile)
  val defaultConfiguration = new Configuration(parsedConfig)

  private def createTokenService(
    configuration: Configuration = defaultConfiguration,
  ): TokenService =
    new TokenService(configuration)

  "TokenService" when {
    val userId = UserId(1)

    "obtainTokens" should {
      val accessTokenContent = AccessTokenContent(userId)
      val refreshTokenContent = RefreshTokenContent(userId, None)
      "return Auth response for new user session" in {
        // Arrange
        val initTimestamp = Instant.now.getEpochSecond
        val tokenService = createTokenService()

        // Act
        val authResponse = tokenService.obtainTokens(accessTokenContent, refreshTokenContent, initTimestamp)

        // Assert
        checkAuthResponse(
          authResponse,
          accessTokenExpiration = initTimestamp + tokenService.accessExpirationTimeInSeconds,
          refreshTokenExpiration = initTimestamp + tokenService.refreshExpirationTimeInSeconds,
          initTimestamp,
          initTimestamp,
          userId,
          tokenService.SECRET_KEY,
          tokenService.hmacAlgorithm
        )
      }
    }

    "refreshTokens" should {
      "return Auth response with updated access token expiration" in {
        // Arrange
        val tokenService = createTokenService()
        val refreshTokenContent = RefreshTokenContent(userId, None)
        val refreshInitTimestamp = Instant.now.getEpochSecond
        val accessInitTimestamp = Instant.now.getEpochSecond
        val refreshToken =
          tokenService.getAuthToken(
            refreshTokenContent,
            refreshInitTimestamp,
            tokenService.refreshExpirationTimeInSeconds
          )

        // Act
        val optAuthResponse = tokenService.refreshTokens(refreshToken, accessInitTimestamp)

        // Assert
        optAuthResponse match {
          case None => fail
          case Some(authResponse) =>
            checkAuthResponse(
              authResponse,
              accessTokenExpiration = accessInitTimestamp + tokenService.accessExpirationTimeInSeconds,
              refreshTokenExpiration = refreshInitTimestamp + tokenService.refreshExpirationTimeInSeconds,
              accessInitTimestamp,
              refreshInitTimestamp,
              userId,
              tokenService.SECRET_KEY,
              tokenService.hmacAlgorithm
            )
        }
      }
      "return None because refresh token is expired" in {
        // Arrange
        val tokenService = createTokenService()
        val refreshTokenContent = RefreshTokenContent(userId, None)
        val refreshInitTimestamp = 0
        val accessInitTimestamp = Instant.now.getEpochSecond
        val expiredRefreshToken =
          tokenService.getAuthToken(
            refreshTokenContent,
            refreshInitTimestamp,
            tokenService.refreshExpirationTimeInSeconds
          )

        // Act
        val optAuthResponse = tokenService.refreshTokens(expiredRefreshToken, accessInitTimestamp)

        // Assert
        optAuthResponse match {
          case None => succeed
          case _    => fail
        }
      }
    }
  }

  def checkAuthResponse(
    authResponse: AuthResponse,
    accessTokenExpiration: Long,
    refreshTokenExpiration: Long,
    accessTokenIssuedAt: Long,
    refreshTokenIssuedAt: Long,
    userId: UserId,
    secretKey: String,
    hmacAlgorithm: JwtHmacAlgorithm
  ): Assertion = {
    val result = for {
      accessTokenClaims <- Jwt.decode(authResponse.accessToken, secretKey, Seq(hmacAlgorithm))
      refreshTokenClaims <- Jwt.decode(authResponse.refreshToken, secretKey, Seq(hmacAlgorithm))
    } yield {
      val accessTokenContent = Json.parse(accessTokenClaims.content).as[AccessTokenContent]
      val refreshTokenContent = Json.parse(refreshTokenClaims.content).as[RefreshTokenContent]

      // Condition
      val isAccessTokenExpirationEqual = accessTokenClaims.expiration.contains(accessTokenExpiration)
      val isAccessTokenIssuedAtEqual = accessTokenClaims.issuedAt.contains(accessTokenIssuedAt)
      val isRefreshTokenExpirationEqual = refreshTokenClaims.expiration.contains(refreshTokenExpiration)
      val isRefreshTokenIssuedAtEqual = accessTokenClaims.issuedAt.contains(refreshTokenIssuedAt)
      val isUserIdEqual = Seq(accessTokenContent.userId, refreshTokenContent.userId).forall(_ == userId)

      isAccessTokenExpirationEqual &&
      isAccessTokenIssuedAtEqual &&
      isRefreshTokenExpirationEqual &&
      isRefreshTokenIssuedAtEqual &&
      isUserIdEqual
    }
    result.toOption.getOrElse(false) shouldBe true
  }

}
