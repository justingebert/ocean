package com.htwhub.ocean.engines

import com.mongodb.MongoClientSettings
import com.mongodb.MongoCredential._
import com.mongodb.ServerAddress
import javax.inject.Inject
import javax.inject.Singleton
import org.mongodb.scala.bson._
import org.mongodb.scala.bson.collection.mutable.Document
import org.mongodb.scala.Completed
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
  password: String
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
      // Todo: check for port
      .applyToClusterSettings(block => block.hosts(List(new ServerAddress(conf.serverName, 27017)).asJava))
      .credential(credential)
      .build()
  }

  private def getMongoDBConfiguration: MongoDBConfiguration = {
    val serverName = config.get[String]("mongodb_cluster.serverName")
    val databaseName = config.get[String]("mongodb_cluster.databaseName")
    val portNumber = config.get[Int]("mongodb_cluster.portNumber")
    val username = config.get[String]("mongodb_cluster.username")
    val password = config.get[String]("mongodb_cluster.password")
    MongoDBConfiguration(serverName, databaseName, portNumber, username, password)
  }

  def createDatabase(databaseName: String): Future[Completed] = {
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
    processCommand(databaseName, createUserDoc)
  }

  def deleteDatabase(databaseName: String): Future[Completed] = {
    val database = mongoClient.getDatabase(databaseName)
    database.drop().toFuture()
  }

  def deleteUser(databaseName: String, username: String): Future[Any] = {
    val dropUserDoc = Document(
      "dropUser" -> BsonString(username)
    )
    processCommand(databaseName, dropUserDoc)
  }

  def deleteUsers(databaseName: String, usernames: List[String]): Future[List[Any]] = {
    val jobs = usernames.map(username => deleteUser(databaseName, username))
    Future.sequence(jobs)
  }

  private def processCommand(databaseName: String, document: Document): Future[Any] = {
    val database = mongoClient.getDatabase(databaseName)
    // ignore bson code problem, scala dogshi.
    database
      .runCommand(document)
      .toFuture()
      .recoverWith(_ => Future.successful(true))
  }
}
