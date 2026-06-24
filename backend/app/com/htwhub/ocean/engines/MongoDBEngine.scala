package com.htwhub.ocean.engines

import com.mongodb.MongoClientSettings
import com.mongodb.MongoCredential._
import com.mongodb.ServerAddress
import javax.inject.Inject
import javax.inject.Singleton
import org.mongodb.scala.bson._
import org.mongodb.scala.bson.collection.mutable.Document
import org.mongodb.scala.MongoClient
import play.api.Configuration
import scala.concurrent.ExecutionContext
import scala.concurrent.Future
import scala.jdk.CollectionConverters._

sealed case class MongoDBConfiguration(
  serverName: String,
  databaseName: String,
  portNumber: Int,
  username: String,
  password: String,
  tls: Boolean
)

@Singleton
class MongoDBEngine @Inject() (config: Configuration)(implicit ec: ExecutionContext) {

  val initialCollection: String = config.get[String]("mongodb_cluster.initialCollection")
  val mongoClient: MongoClient = MongoClient(getMongoClientSettings)

  private def getMongoClientSettings: MongoClientSettings = {
    val conf = getMongoDBConfiguration
    val credential = createCredential(conf.username, conf.databaseName, conf.password.toCharArray)
    MongoClientSettings
      .builder()
      .applyToClusterSettings(block => block.hosts(List(new ServerAddress(conf.serverName, conf.portNumber)).asJava))
      .applyToSslSettings(block => block.enabled(conf.tls))
      .credential(credential)
      .build()
  }

  private def getMongoDBConfiguration: MongoDBConfiguration = {
    val serverName = config.get[String]("mongodb_cluster.serverName")
    val databaseName = config.get[String]("mongodb_cluster.databaseName")
    val portNumber = config.get[Int]("mongodb_cluster.portNumber")
    val username = config.get[String]("mongodb_cluster.username")
    val password = config.get[String]("mongodb_cluster.password")
    val tls = config.get[Boolean]("mongodb_cluster.tls")
    MongoDBConfiguration(serverName, databaseName, portNumber, username, password, tls)
  }

  def createDatabase(databaseName: String): Future[Unit] = {
    val database = mongoClient.getDatabase(databaseName)
    database.createCollection(initialCollection).toFuture()
  }

  def createUser(databaseName: String, username: String, password: String): Future[Any] = {
    val readWriteRoleDoc = Document(
      "role" -> BsonString("readWrite"),
      "db" -> BsonString(databaseName)
    )
    val createUserDoc = Document(
      "createUser" -> BsonString(username),
      "pwd" -> BsonString(password),
      "roles" -> BsonArray(readWriteRoleDoc)
    )
    runDatabaseCommand(databaseName, createUserDoc)
  }

  def deleteDatabase(databaseName: String): Future[Unit] =
    for {
      _ <- deleteAllUsers(databaseName)
      _ <- mongoClient.getDatabase(databaseName).drop().toFuture()
    } yield ()

  def deleteUser(databaseName: String, username: String): Future[Any] =
    runDatabaseCommand(databaseName, Document("dropUser" -> BsonString(username)))

  def deleteUsers(databaseName: String, usernames: List[String]): Future[List[Any]] =
    Future.sequence(usernames.map(deleteUser(databaseName, _)))

  def deleteAllUsers(databaseName: String): Future[Any] =
    runDatabaseCommand(databaseName, Document("dropAllUsersFromDatabase" -> BsonInt32(1)))

  private def runDatabaseCommand(databaseName: String, document: Document): Future[Any] = {
    val database = mongoClient.getDatabase(databaseName)
    // Decode the reply into BsonDocument. The default result type would be the mutable
    // `Document` imported above, whose codec can only encode, not decode the server reply
    // ("The BsonCodec can only encode to Bson").
    database.runCommand[BsonDocument](document).toFuture()
  }
}
