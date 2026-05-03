package com.htwhub.ocean.managers

import com.htwhub.ocean.engines.PostgreSQLEngine
import com.htwhub.ocean.models.User
import com.htwhub.ocean.models.UserId
import com.htwhub.ocean.serializers.auth.AccessTokenContent
import com.htwhub.ocean.serializers.auth.AuthResponse
import com.htwhub.ocean.serializers.auth.RefreshTokenContent
import com.htwhub.ocean.serializers.auth.SignInRequest
import com.htwhub.ocean.service.LdapService
import com.htwhub.ocean.service.TokenService
import com.htwhub.ocean.service.UserService
import com.typesafe.config.Config
import com.typesafe.config.ConfigFactory
import java.io.File
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.never
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
import org.mockito.Mockito.when
import org.scalatest.AsyncWordSpec
import org.scalatest.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.Configuration
import scala.concurrent.Future

class AuthManagerSpec extends AsyncWordSpec with Matchers with MockitoSugar {

  val myConfigFile = new File("conf/application.test.conf")
  val parsedConfig: Config = ConfigFactory.parseFile(myConfigFile)
  val defaultConfiguration = new Configuration(parsedConfig)

  val defaultUserService: UserService = mock[UserService]
  val defaultLdapService: LdapService = mock[LdapService]
  val defaultTokenService: TokenService = mock[TokenService]
  val defaultPostgreSQLEngine: PostgreSQLEngine = mock[PostgreSQLEngine]

  private def createAuthManager(
    configuration: Configuration = defaultConfiguration,
    userService: UserService = defaultUserService,
    ldapService: LdapService = defaultLdapService,
    postgreSQLEngine: PostgreSQLEngine = defaultPostgreSQLEngine,
    tokenService: TokenService = defaultTokenService,
  ): AuthManager =
    new AuthManager(
      configuration,
      userService,
      ldapService,
      postgreSQLEngine,
      tokenService,
    )

  "AuthManager" when {
    "signIn" should {
      "return auth response while user already exists" in {
        // Arrange
        val user = User(UserId(1), "username", "firstName", "lastName", "mail", "Unknown")

        val ldapService = mock[LdapService]
        when(ldapService.authenticate(any[String], any[String])).thenReturn(Future(user))
        val userService = mock[UserService]
        when(userService.getUserByUsername(any[String])).thenReturn(Future(user))
        when(userService.addUser(any[User])).thenReturn(Future(user))
        val tokenService = mock[TokenService]
        val mockAuthResponse = AuthResponse("accessToken", "refreshToken")
        when(tokenService.obtainTokens(any[AccessTokenContent], any[RefreshTokenContent], any[Long]))
          .thenReturn(mockAuthResponse)

        val authManager =
          createAuthManager(userService = userService, ldapService = ldapService, tokenService = tokenService)

        // Act
        val futureAuthResponse = authManager.signIn(SignInRequest(user.username, "password"))

        // Assert
        futureAuthResponse.map { actual =>
          verify(ldapService, times(1)).authenticate(any[String], any[String])
          verify(userService, times(1)).getUserByUsername(any[String])
          verify(tokenService, times(1)).obtainTokens(any[AccessTokenContent], any[RefreshTokenContent], any[Long])
          verify(userService, never()).addUser(any[User])
          actual shouldBe mockAuthResponse
        }

        true shouldBe true
      }
    }
  }

}
