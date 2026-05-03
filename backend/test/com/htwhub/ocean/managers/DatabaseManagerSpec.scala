package com.htwhub.ocean.managers
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
import com.htwhub.ocean.service.InstanceService
import com.htwhub.ocean.service.InvitationService
import com.htwhub.ocean.service.RoleService
import com.htwhub.ocean.service.UserService
import java.sql.Timestamp
import java.time.Instant
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.never
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
import org.mockito.Mockito.when
import org.mongodb.scala.Completed
import org.scalatest.AsyncWordSpec
import org.scalatest.Matchers
import org.scalatestplus.mockito.MockitoSugar
import scala.concurrent.Future

class DatabaseManagerSpec extends AsyncWordSpec with Matchers with MockitoSugar {

  val defaultInstanceService: InstanceService = mock[InstanceService]
  val defaultRoleService: RoleService = mock[RoleService]
  val defaultInvitationService: InvitationService = mock[InvitationService]
  val defaultUserService: UserService = mock[UserService]
  val defaultPostgreSQLEngine: PostgreSQLEngine = mock[PostgreSQLEngine]
  val defaultMongoDBEngine: MongoDBEngine = mock[MongoDBEngine]

  private def createDatabaseManager(
    instanceService: InstanceService = defaultInstanceService,
    roleService: RoleService = defaultRoleService,
    invitationService: InvitationService = defaultInvitationService,
    userService: UserService = defaultUserService,
    postgreSQLEngine: PostgreSQLEngine = defaultPostgreSQLEngine,
    mongoDBEngine: MongoDBEngine = defaultMongoDBEngine,
  ): DatabaseManager =
    new DatabaseManager(
      instanceService,
      roleService,
      invitationService,
      userService,
      postgreSQLEngine,
      mongoDBEngine
    )

  "DatabaseManager" when {
    "getUserInstances" should {
      val user = User(UserId(1), "username", "firstName", "lastName", "mail", "Unknown")
      "return user instances" in {
        // Arrange
        val instances: Seq[Instance] = Seq(
          Instance(InstanceId(1), UserId(1), "name", PostgreSQLEngineType, Timestamp.from(Instant.now))
        )
        val instanceService = mock[InstanceService]
        when(instanceService.getUserInstances(any[UserId])).thenReturn(Future(instances))

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
        when(instanceService.getUserInstances(any[UserId])).thenReturn(Future.failed(instanceServiceException))
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
        val instance = Instance(InstanceId(1), user.id, "name", PostgreSQLEngineType, Timestamp.from(Instant.now))
        val instanceService = mock[InstanceService]
        when(instanceService.addInstance(any[Instance], any[UserId])).thenReturn(Future(instance))

        val postgreSQLEngine = mock[PostgreSQLEngine]
        when(postgreSQLEngine.createDatabase(any[String])).thenReturn(Future(Vector(1)))
        when(postgreSQLEngine.revokePublicAccess(any[String])).thenReturn(Future(Vector(1)))
        when(postgreSQLEngine.grantDatabaseAccess(any[String], any[String])).thenReturn(Future(Vector(1)))

        val mongoDBEngine = mock[MongoDBEngine]
        when(mongoDBEngine.createDatabase(any[String])).thenReturn(Future(Completed()))

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
        val instance = Instance(InstanceId(1), user.id, "name", MongoDBSQLEngineType, Timestamp.from(Instant.now))
        val instanceService = mock[InstanceService]
        when(instanceService.addInstance(any[Instance], any[UserId])).thenReturn(Future(instance))

        val mongoDBEngine = mock[MongoDBEngine]
        when(mongoDBEngine.createDatabase(any[String])).thenReturn(Future(Completed()))

        val postgreSQLEngine = mock[PostgreSQLEngine]
        when(postgreSQLEngine.createDatabase(any[String])).thenReturn(Future(Vector(1)))

        val databaseManager =
          createDatabaseManager(
            instanceService = instanceService,
            postgreSQLEngine = postgreSQLEngine,
            mongoDBEngine = mongoDBEngine
          )

        // Act
        val futureInstance =
          databaseManager.addDatabase(CreateDatabaseRequest(instance.name, MongoDBSQLEngineType), user)

        // Assert
        futureInstance.map { actual =>
          verify(mongoDBEngine, times(1)).createDatabase(instance.name)
          verify(postgreSQLEngine, never()).createDatabase(any[String])
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
        val instance = Instance(InstanceId(1), user.id, "name", PostgreSQLEngineType, Timestamp.from(Instant.now))
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
        when(instanceService.getUserInstanceById(any[InstanceId], any[UserId])).thenReturn(Future(instance))
        when(instanceService.deleteInstance(any[InstanceId], any[UserId])).thenReturn(Future(1))

        // roles delete process
        val roleService = mock[RoleService]
        when(roleService.getRolesByInstanceId(any[InstanceId], any[UserId])).thenReturn(Future(roles))
        when(roleService.deleteRolesByInstanceId(any[InstanceId], any[UserId])).thenReturn(Future(1))

        // invitation delete process
        val invitationService = mock[InvitationService]
        when(invitationService.getInvitationsByInstanceId(any[InstanceId], any[UserId])).thenReturn(Future(invitations))
        val userService = mock[UserService]
        when(userService.getUsersByIds(any[List[UserId]])).thenReturn(Future(List(invitedUser)))
        when(invitationService.deleteInvitationsByIds(any[List[InvitationId]], any[UserId])).thenReturn(Future(List(1)))

        // PostgreSQL engine process
        val postgreSQLEngine = mock[PostgreSQLEngine]
        when(postgreSQLEngine.deleteDatabase(any[String])).thenReturn(Future(Vector(1)))
        when(postgreSQLEngine.dropRolesComplete(any[List[String]])).thenReturn(Future(List(Vector(1))))
        when(postgreSQLEngine.revokeDatabaseAccessBulk(any[List[String]], any[String]))
          .thenReturn(Future(List(Vector(1))))

        val mongoDBEngine = mock[MongoDBEngine]
        when(mongoDBEngine.deleteDatabase(any[String])).thenReturn(Future(Completed()))

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
    }
  }
}
