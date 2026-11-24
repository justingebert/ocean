package com.htwhub.ocean.managers
import com.htwhub.ocean.cleanup.CleanupConfig
import com.htwhub.ocean.engines.MongoDBEngine
import com.htwhub.ocean.engines.PostgreSQLEngine
import com.htwhub.ocean.managers.DatabaseManager.Exceptions.DatabaseManagerException
import com.htwhub.ocean.models.Instance
import com.htwhub.ocean.models.Instance.MongoDBSQLEngineType
import com.htwhub.ocean.models.Instance.PostgreSQLEngineType
import com.htwhub.ocean.models.InstanceId
import com.htwhub.ocean.models.Invitation
import com.htwhub.ocean.models.InvitationId
import com.htwhub.ocean.models.Role
import com.htwhub.ocean.models.RoleId
import com.htwhub.ocean.models.User
import com.htwhub.ocean.models.UserId
import com.htwhub.ocean.serializers.database.CreateDatabaseRequest
import com.htwhub.ocean.serializers.role.CreateRoleRequest
import com.htwhub.ocean.service.InstanceService
import com.htwhub.ocean.service.InvitationService
import com.htwhub.ocean.service.RoleService
import com.htwhub.ocean.service.UserService
import java.sql.Timestamp
import java.time.Duration
import java.time.Instant
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.anyLong
import org.mockito.Mockito.never
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
import org.mockito.Mockito.when
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AsyncWordSpec
import org.scalatestplus.mockito.MockitoSugar
import play.api.Configuration
import scala.concurrent.Future

class DatabaseManagerSpec extends AsyncWordSpec with Matchers with MockitoSugar {

  val defaultInstanceService: InstanceService = mock[InstanceService]
  val defaultRoleService: RoleService = mock[RoleService]
  val defaultInvitationService: InvitationService = mock[InvitationService]
  val defaultUserService: UserService = mock[UserService]
  val defaultPostgreSQLEngine: PostgreSQLEngine = mock[PostgreSQLEngine]
  val defaultMongoDBEngine: MongoDBEngine = mock[MongoDBEngine]
  val defaultRoleManager: RoleManager = mock[RoleManager]
  val cleanupConfig = new CleanupConfig(Configuration("ocean.cleanup.lifetime-days" -> 180))

  private def createDatabaseManager(
    instanceService: InstanceService = defaultInstanceService,
    roleService: RoleService = defaultRoleService,
    invitationService: InvitationService = defaultInvitationService,
    userService: UserService = defaultUserService,
    postgreSQLEngine: PostgreSQLEngine = defaultPostgreSQLEngine,
    mongoDBEngine: MongoDBEngine = defaultMongoDBEngine,
    roleManager: RoleManager = defaultRoleManager,
  ): DatabaseManager =
    new DatabaseManager(
      instanceService,
      roleService,
      invitationService,
      userService,
      postgreSQLEngine,
      mongoDBEngine,
      roleManager,
      cleanupConfig
    )

  "DatabaseManager" when {
    "getUserInstances" should {
      val user = User(UserId(1), "username", "firstName", "lastName", "mail", "Unknown")
      "return user instances" in {
        // Arrange
        val instances: Seq[Instance] = Seq(
          Instance(InstanceId(1), UserId(1), "name", PostgreSQLEngineType, Timestamp.from(Instant.now), None, 0)
        )
        val instanceService = mock[InstanceService]
        when(instanceService.getUserInstances(UserId(anyLong()))).thenReturn(Future(instances))

        val databaseManager = createDatabaseManager(instanceService = instanceService)

        // Act
        val futureUserInstances = databaseManager.getUserInstances(user)

        // Assert
        futureUserInstances.map { actual =>
          verify(instanceService, times(1)).getUserInstances(user.id)
          actual shouldBe instances
        }
      }

      "return a DatabaseManagerException cause by an InstanceServiceException" in {
        // Arrange
        val instanceServiceException: InstanceService.Exceptions.InternalError =
          InstanceService.Exceptions.InternalError("")
        val instanceService = mock[InstanceService]
        when(instanceService.getUserInstances(UserId(anyLong()))).thenReturn(Future.failed(instanceServiceException))
        val databaseManager = createDatabaseManager(instanceService = instanceService)

        // Act
        val futureUserInstances = databaseManager.getUserInstances(user)

        // Assert
        futureUserInstances.failed.map(_.isInstanceOf[DatabaseManagerException] shouldBe true)
      }
    }

    "addDatabase" should {
      val user = User(UserId(1), "username", "firstName", "lastName", "mail", "Unknown")
      "create a database with engine type postgresql" in {
        // Arrange
        val instance =
          Instance(InstanceId(1), user.id, "name", PostgreSQLEngineType, Timestamp.from(Instant.now), None, 0)
        val instanceService = mock[InstanceService]
        when(instanceService.addInstance(any[Instance], UserId(anyLong()))).thenReturn(Future(instance))

        val postgreSQLEngine = mock[PostgreSQLEngine]
        when(postgreSQLEngine.createDatabase(any[String])).thenReturn(Future(Vector(1)))
        when(postgreSQLEngine.revokePublicAccess(any[String])).thenReturn(Future(Vector(1)))
        when(postgreSQLEngine.grantDatabaseAccess(any[String], any[String])).thenReturn(Future(Vector(1)))
        when(postgreSQLEngine.grantAccessToPublicSchema(any[String])).thenReturn(Future(Vector(1)))

        val mongoDBEngine = mock[MongoDBEngine]
        when(mongoDBEngine.createDatabase(any[String])).thenReturn(Future(()))

        val databaseManager =
          createDatabaseManager(
            instanceService = instanceService,
            postgreSQLEngine = postgreSQLEngine,
            mongoDBEngine = mongoDBEngine
          )

        // Act
        val futureInstance =
          databaseManager.addDatabase(CreateDatabaseRequest(instance.name, PostgreSQLEngineType), user)

        // Assert
        futureInstance.map { actual =>
          verify(postgreSQLEngine, times(1)).createDatabase(instance.name)
          verify(postgreSQLEngine, times(1)).revokePublicAccess(instance.name)
          verify(postgreSQLEngine, times(1)).grantDatabaseAccess(instance.name, user.username)
          verify(mongoDBEngine, never()).createDatabase(any[String])
          actual shouldBe instance
        }
      }
      "create a database with engine type mongodb" in {
        // Arrange
        val instance =
          Instance(InstanceId(1), user.id, "name", MongoDBSQLEngineType, Timestamp.from(Instant.now), None, 0)
        val instanceService = mock[InstanceService]
        when(instanceService.addInstance(any[Instance], UserId(anyLong()))).thenReturn(Future(instance))

        val mongoDBEngine = mock[MongoDBEngine]
        when(mongoDBEngine.createDatabase(any[String])).thenReturn(Future(()))

        val postgreSQLEngine = mock[PostgreSQLEngine]
        when(postgreSQLEngine.createDatabase(any[String])).thenReturn(Future(Vector(1)))

        // The default login user is provisioned by delegating to RoleManager.
        val defaultRole = Role(RoleId(0), instance.id, instance.name, "password")
        val roleManager = mock[RoleManager]
        when(roleManager.addRole(any[CreateRoleRequest], any[User])).thenReturn(Future(defaultRole))

        val databaseManager =
          createDatabaseManager(
            instanceService = instanceService,
            postgreSQLEngine = postgreSQLEngine,
            mongoDBEngine = mongoDBEngine,
            roleManager = roleManager
          )

        // Act
        val futureInstance =
          databaseManager.addDatabase(CreateDatabaseRequest(instance.name, MongoDBSQLEngineType), user)

        // Assert
        futureInstance.map { actual =>
          verify(mongoDBEngine, times(1)).createDatabase(instance.name)
          verify(postgreSQLEngine, never()).createDatabase(any[String])
          verify(roleManager, times(1)).addRole(CreateRoleRequest(instance.id.value, instance.name), user)
          actual shouldBe instance
        }
      }
    }
    "deleteDatabase" should {
      "delete a database with engine type postgresql" in {
        // Arrange

        // Entities
        val user = User(UserId(1), "user", "firstName", "lastName", "mail", "unknown")
        val invitedUser = User(UserId(2), "invitedUser", "firstName", "lastName", "mail", "unknown")
        val instance =
          Instance(InstanceId(1), user.id, "name", PostgreSQLEngineType, Timestamp.from(Instant.now), None, 0)
        val roles: List[Role] = List(
          Role(RoleId(1), instance.id, "alice", "password"),
          Role(RoleId(2), instance.id, "bob", "password"),
          Role(RoleId(3), instance.id, "eve", "password")
        )
        val invitations: List[Invitation] = List(
          Invitation(InvitationId(1), instance.id, invitedUser.id, Timestamp.from(Instant.now))
        )

        // Collect instance data
        val instanceService = mock[InstanceService]
        when(instanceService.getUserInstanceById(InstanceId(anyLong()), UserId(anyLong()))).thenReturn(Future(instance))
        when(instanceService.deleteInstance(InstanceId(anyLong()), UserId(anyLong()))).thenReturn(Future(1))

        // roles delete process
        val roleService = mock[RoleService]
        when(roleService.getRolesByInstanceId(InstanceId(anyLong()), UserId(anyLong()))).thenReturn(Future(roles))
        when(roleService.deleteRolesByInstanceId(InstanceId(anyLong()), UserId(anyLong()))).thenReturn(Future(1))

        // invitation delete process
        val invitationService = mock[InvitationService]
        when(invitationService.getInvitationsByInstanceId(InstanceId(anyLong()), UserId(anyLong())))
          .thenReturn(Future(invitations))
        val userService = mock[UserService]
        when(userService.getUsersByIds(any[List[UserId]])).thenReturn(Future(List(invitedUser)))
        when(invitationService.deleteInvitationsByIds(any[List[InvitationId]], UserId(anyLong())))
          .thenReturn(Future(List(1)))

        // PostgreSQL engine process
        val postgreSQLEngine = mock[PostgreSQLEngine]
        when(postgreSQLEngine.deleteDatabase(any[String])).thenReturn(Future(Vector(1)))
        when(postgreSQLEngine.dropRolesComplete(any[List[String]])).thenReturn(Future(List(Vector(1))))
        when(postgreSQLEngine.revokeDatabaseAccessBulk(any[List[String]], any[String]))
          .thenReturn(Future(List(Vector(1))))

        val mongoDBEngine = mock[MongoDBEngine]
        when(mongoDBEngine.deleteDatabase(any[String])).thenReturn(Future(()))

        val databaseManager =
          createDatabaseManager(
            instanceService = instanceService,
            userService = userService,
            roleService = roleService,
            invitationService = invitationService,
            postgreSQLEngine = postgreSQLEngine,
            mongoDBEngine = mongoDBEngine,
          )

        // Act
        val futureReturn = databaseManager.deleteDatabase(instance.id, user)

        // Assert
        futureReturn.map { actual =>
          verify(postgreSQLEngine, times(1)).deleteDatabase(instance.name)
          verify(postgreSQLEngine, times(1)).dropRolesComplete(List("alice", "bob", "eve"))
          verify(postgreSQLEngine, times(1)).revokeDatabaseAccessBulk(any[List[String]], any[String])
          verify(mongoDBEngine, never()).createDatabase(any[String])
          actual.isEmpty shouldBe false
        }
      }
      "delete a database with engine type mongodb" in {
        // Arrange

        val user = User(UserId(1), "user", "firstName", "lastName", "mail", "unknown")
        val instance =
          Instance(InstanceId(1), user.id, "mongo_docs", MongoDBSQLEngineType, Timestamp.from(Instant.now), None, 0)
        val roles: List[Role] = List(
          Role(RoleId(1), instance.id, "mongo_docs", "password"),
          Role(RoleId(2), instance.id, "mongo_docs_reader", "password")
        )

        val instanceService = mock[InstanceService]
        when(instanceService.getUserInstanceById(InstanceId(anyLong()), UserId(anyLong()))).thenReturn(Future(instance))
        when(instanceService.deleteInstance(InstanceId(anyLong()), UserId(anyLong()))).thenReturn(Future(1))

        val roleService = mock[RoleService]
        when(roleService.getRolesByInstanceId(InstanceId(anyLong()), UserId(anyLong()))).thenReturn(Future(roles))
        when(roleService.deleteRolesByIds(any[List[RoleId]], UserId(anyLong()))).thenReturn(Future(List(1, 1)))

        val mongoDBEngine = mock[MongoDBEngine]
        when(mongoDBEngine.deleteDatabase(any[String])).thenReturn(Future(()))

        val postgreSQLEngine = mock[PostgreSQLEngine]
        when(postgreSQLEngine.deleteDatabase(any[String])).thenReturn(Future(Vector(1)))

        val databaseManager =
          createDatabaseManager(
            instanceService = instanceService,
            roleService = roleService,
            postgreSQLEngine = postgreSQLEngine,
            mongoDBEngine = mongoDBEngine,
          )

        // Act
        val futureReturn = databaseManager.deleteDatabase(instance.id, user)

        // Assert
        futureReturn.map { actual =>
          verify(mongoDBEngine, times(1)).deleteDatabase(instance.name)
          verify(roleService, times(1)).deleteRolesByIds(List(RoleId(1), RoleId(2)), user.id)
          verify(instanceService, times(1)).deleteInstance(instance.id, user.id)
          verify(postgreSQLEngine, never()).deleteDatabase(any[String])
          actual shouldBe List(1, 1, 1)
        }
      }
    }

    "expiry" should {
      val owner = User(UserId(1), "owner", "firstName", "lastName", "mail", "Student")
      val staff = User(UserId(2), "staff", "firstName", "lastName", "mail", "Staff")
      val instance =
        Instance(InstanceId(1), owner.id, "name", PostgreSQLEngineType, Timestamp.from(Instant.now), None, 0)

      def isAboutOneLifetimeFromNow(expiresAt: Option[Timestamp]): Boolean =
        expiresAt.exists { t =>
          val expected = Instant.now.plus(Duration.ofDays(180))
          Duration.between(t.toInstant, expected).abs.compareTo(Duration.ofMinutes(1)) < 0
        }

      def captureExpiry(instanceService: InstanceService): Option[Timestamp] = {
        val captor: ArgumentCaptor[Option[Timestamp]] = ArgumentCaptor.forClass(classOf[Option[Timestamp]])
        verify(instanceService).updateExpiry(InstanceId(anyLong()), captor.capture())
        captor.getValue
      }

      "set the expiry date one lifetime from now when a database is created" in {
        val instanceService = mock[InstanceService]
        when(instanceService.addInstance(any[Instance], UserId(anyLong()))).thenReturn(Future(instance))
        val postgreSQLEngine = mock[PostgreSQLEngine]
        when(postgreSQLEngine.createDatabase(any[String])).thenReturn(Future(Vector(1)))
        when(postgreSQLEngine.revokePublicAccess(any[String])).thenReturn(Future(Vector(1)))
        when(postgreSQLEngine.grantDatabaseAccess(any[String], any[String])).thenReturn(Future(Vector(1)))
        when(postgreSQLEngine.grantAccessToPublicSchema(any[String])).thenReturn(Future(Vector(1)))
        val databaseManager =
          createDatabaseManager(instanceService = instanceService, postgreSQLEngine = postgreSQLEngine)

        databaseManager.addDatabase(CreateDatabaseRequest("name", PostgreSQLEngineType), owner).map { _ =>
          val captor: ArgumentCaptor[Instance] = ArgumentCaptor.forClass(classOf[Instance])
          verify(instanceService).addInstance(captor.capture(), UserId(anyLong()))
          isAboutOneLifetimeFromNow(captor.getValue.expiresAt) shouldBe true
          captor.getValue.remindersSent shouldBe 0
        }
      }

      "renew a database for its owner" in {
        val expiring = instance.copy(expiresAt = Some(Timestamp.from(Instant.now.plus(Duration.ofDays(3)))))
        val instanceService = mock[InstanceService]
        when(instanceService.getUserInstanceById(InstanceId(anyLong()), UserId(anyLong()))).thenReturn(Future(expiring))
        when(instanceService.updateExpiry(InstanceId(anyLong()), any[Option[Timestamp]])).thenReturn(Future(expiring))
        val databaseManager = createDatabaseManager(instanceService = instanceService)

        databaseManager.renewDatabase(expiring.id, owner).map { _ =>
          isAboutOneLifetimeFromNow(captureExpiry(instanceService)) shouldBe true
        }
      }

      "leave a never expiring database untouched when its owner renews it" in {
        val instanceService = mock[InstanceService]
        when(instanceService.getUserInstanceById(InstanceId(anyLong()), UserId(anyLong()))).thenReturn(Future(instance))
        val databaseManager = createDatabaseManager(instanceService = instanceService)

        databaseManager.renewDatabase(instance.id, owner).map { result =>
          verify(instanceService, never()).updateExpiry(InstanceId(anyLong()), any[Option[Timestamp]])
          result.expiresAt shouldBe None
        }
      }

      "not renew a database for anyone but its owner" in {
        val instanceService = mock[InstanceService]
        when(instanceService.getUserInstanceById(InstanceId(anyLong()), UserId(anyLong())))
          .thenReturn(Future.failed(InstanceService.Exceptions.AccessDenied()))
        val databaseManager = createDatabaseManager(instanceService = instanceService)

        databaseManager.renewDatabase(instance.id, staff).failed.map { error =>
          verify(instanceService, never()).updateExpiry(InstanceId(anyLong()), any[Option[Timestamp]])
          error shouldBe DatabaseManager.Exceptions.AccessDenied()
        }
      }

      "clear the expiry date when an admin sets never expires" in {
        val instanceService = mock[InstanceService]
        when(instanceService.getUserInstanceWithPermission(InstanceId(anyLong()), any[User]))
          .thenReturn(Future(instance))
        when(instanceService.updateExpiry(InstanceId(anyLong()), any[Option[Timestamp]])).thenReturn(Future(instance))
        val databaseManager = createDatabaseManager(instanceService = instanceService)

        databaseManager.setDatabaseNeverExpires(instance.id, neverExpires = true, staff).map { _ =>
          captureExpiry(instanceService) shouldBe None
        }
      }

      "restart a full lifetime when an admin switches never expires off" in {
        val instanceService = mock[InstanceService]
        when(instanceService.getUserInstanceWithPermission(InstanceId(anyLong()), any[User]))
          .thenReturn(Future(instance))
        when(instanceService.updateExpiry(InstanceId(anyLong()), any[Option[Timestamp]])).thenReturn(Future(instance))
        val databaseManager = createDatabaseManager(instanceService = instanceService)

        databaseManager.setDatabaseNeverExpires(instance.id, neverExpires = false, staff).map { _ =>
          isAboutOneLifetimeFromNow(captureExpiry(instanceService)) shouldBe true
        }
      }

      "not let non-admins set never expires" in {
        val instanceService = mock[InstanceService]
        when(instanceService.getUserInstanceWithPermission(InstanceId(anyLong()), any[User]))
          .thenReturn(Future.failed(InstanceService.Exceptions.AccessDenied()))
        val databaseManager = createDatabaseManager(instanceService = instanceService)

        databaseManager.setDatabaseNeverExpires(instance.id, neverExpires = true, owner).failed.map { error =>
          verify(instanceService, never()).updateExpiry(InstanceId(anyLong()), any[Option[Timestamp]])
          error shouldBe DatabaseManager.Exceptions.AccessDenied()
        }
      }
    }
  }
}
