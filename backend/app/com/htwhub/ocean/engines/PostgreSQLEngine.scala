package com.htwhub.ocean.engines

import com.typesafe.config.ConfigFactory
import javax.inject.Inject
import javax.inject.Singleton
import play.api.Configuration
import scala.concurrent.duration.DurationInt
import scala.concurrent.Await
import scala.concurrent.ExecutionContext
import scala.concurrent.Future
import scala.util.Failure
import scala.util.Success

@Singleton
class PostgreSQLEngine @Inject() (config: Configuration)(implicit ec: ExecutionContext) {

  import slick.jdbc.PostgresProfile.api._

  val db = Database.forConfig("pg_cluster")

  def createDatabase(databaseName: String): Future[Vector[Int]] = {
    val createDatabaseStatement = sql"""CREATE DATABASE #${databaseName}"""
    db.run(createDatabaseStatement.as[Int])
  }

  def deleteDatabase(databaseName: String): Future[Vector[Int]] = {
    val deleteDatabaseStatement = sql"""DROP DATABASE IF EXISTS #${databaseName}"""
    db.run(deleteDatabaseStatement.as[Int])
  }

  def createGroup(groupName: String): Future[Vector[Int]] = {
    val createGroupStatement = sql"""CREATE ROLE #${groupName} WITH NOSUPERUSER"""
    db.run(createGroupStatement.as[Int])
  }

  def createRoleInGroup(roleName: String, groupName: String): Future[Vector[Int]] = {
    val createRoleInGroupStatement =
      sql"""CREATE ROLE #${roleName} WITH NOSUPERUSER LOGIN CONNECTION LIMIT 500 IN ROLE #${groupName}"""
    db.run(createRoleInGroupStatement.as[Int])
  }

  def createRoleInGroupWithPassword(roleName: String, groupName: String, password: String): Future[Vector[Int]] = {
    val createRoleInGroupWithPasswordStatement =
      sql"""CREATE ROLE #${roleName} WITH NOSUPERUSER LOGIN CONNECTION LIMIT 500 IN ROLE #${groupName} PASSWORD '#${password}'"""
    db.run(createRoleInGroupWithPasswordStatement.as[Int])
  }

  def dropRolesComplete(roleNames: List[String]): Future[List[Vector[Int]]] = {
    val jobs: List[Future[Vector[Int]]] = roleNames map { roleName =>
      dropRoleComplete(roleName)
    }
    Future.sequence(jobs)
  }

  def dropRoleComplete(roleName: String): Future[Vector[Int]] =
    for {
      job1 <- reassignedOwnedBy(roleName)
      job2 <- dropOwnedBy(roleName)
      job3 <- dropRole(roleName)
    } yield (job1 ++ job2 ++ job3)

  def dropRole(roleName: String): Future[Vector[Int]] = {
    val dropRoleStatement = sql"""DROP ROLE #${roleName}"""
    db.run(dropRoleStatement.as[Int])
  }

  def existsRole(roleName: String): Future[Vector[Int]] = {
    val existsDatabaseStatement = sql"""SELECT 1 FROM pg_roles WHERE rolname='#${roleName}'"""
    db.run(existsDatabaseStatement.as[Int])
  }

  def grantDatabaseAccess(databaseName: String, roleName: String): Future[Vector[Int]] = {
    val grantDatabaseAccessStatement = sql"""GRANT ALL PRIVILEGES ON DATABASE #${databaseName} to #${roleName}"""
    db.run(grantDatabaseAccessStatement.as[Int])
  }

  def revokePublicAccess(databaseName: String): Future[Vector[Int]] = {
    val revokePublicAccessStatement = sql"""REVOKE ALL ON DATABASE #${databaseName} FROM PUBLIC"""
    db.run(revokePublicAccessStatement.as[Int])
  }

  def revokeDatabaseAccess(roleName: String, databaseName: String): Future[Vector[Int]] = {
    val revokeDatabaseAccessStatement = sql"""REVOKE ALL PRIVILEGES ON DATABASE #${databaseName} FROM #${roleName}"""
    db.run(revokeDatabaseAccessStatement.as[Int])
  }

  def revokeDatabaseAccessBulk(roleNames: List[String], databaseName: String): Future[List[Vector[Int]]] = {
    val jobs: List[Future[Vector[Int]]] = roleNames map { roleName =>
      revokeDatabaseAccess(roleName, databaseName)
    }
    Future.sequence(jobs)
  }

  def dropOwnedBy(roleName: String): Future[Vector[Int]] = {
    val dropOwnedByStatement = sql"""DROP OWNED BY #${roleName}"""
    db.run(dropOwnedByStatement.as[Int])
  }

  def reassignedOwnedBy(roleName: String): Future[Vector[Int]] = {
    val reassignedOwnedByStatement = sql"""REASSIGN OWNED BY #${roleName} TO postgres"""
    db.run(reassignedOwnedByStatement.as[Int])
  }

  def getJDBCConnection(dbName: String): Future[Database] = {
    val serverName = Future {
      config.getOptional[String]("pg_cluster.properties.serverName")
    } flatMap {
      case Some(value) => Future.successful(value)
      case None        => Future.failed(new Error())
    }

    val portNumber = Future {
      config.getOptional[String]("pg_cluster.properties.portNumber")
    } flatMap {
      case Some(value) => Future.successful(value)
      case None        => Future.failed(new Error())
    }

    val userName = Future {
      config.getOptional[String]("pg_cluster.properties.user")
    } flatMap {
      case Some(value) => Future.successful(value)
      case None        => Future.failed(new Error())
    }

    val userPassword = Future {
      config.getOptional[String]("pg_cluster.properties.password")
    } flatMap {
      case Some(value) => Future.successful(value)
      case None        => Future.failed(new Error())
    }

    val sslMode = config.getOptional[String]("pg_cluster.properties.sslmode").getOrElse("disable")
    val sslFactory = config
      .getOptional[String]("pg_cluster.properties.sslfactory")
      .getOrElse("org.postgresql.ssl.DefaultJavaSSLFactory")

    for {
      server <- serverName
      port <- portNumber
      user <- userName
      password <- userPassword
    } yield {
      val dbURL =
        s"jdbc:postgresql://${server}:${port}/${dbName}?user=${user}&password=${password}&sslmode=${sslMode}&sslfactory=${sslFactory}"
      Database.forURL(dbURL)
    }
  }

  def grantAccess(db: Database): Future[Vector[Int]] = {
    val accessPublicSchemaStatement = sql"""GRANT CREATE,USAGE ON SCHEMA public TO public"""
    db.run(accessPublicSchemaStatement.as[Int])
  }

  def grantAccessToPublicSchema(dbName: String): Future[Vector[Int]] =
    for {
      dbCon <- getJDBCConnection(dbName)
      res <- grantAccess(dbCon)
    } yield {
      dbCon.close
      res
    }
    /*
    val serverName = Future {
      config.getOptional[String]("pg_cluster.properties.serverName")
    } flatMap {
      case Some(value) => Future.successful(value)
      case None        => Future.failed(new Error())
    }

    val portNumber = Future {
      config.getOptional[String]("pg_cluster.properties.portNumber")
    } flatMap {
      case Some(value) => Future.successful(value)
      case None        => Future.failed(new Error())
    }

    val userName= Future {
      config.getOptional[String]("pg_cluster.properties.user")
    } flatMap {
      case Some(value) => Future.successful(value)
      case None        => Future.failed(new Error())
    }

    val userPassword = Future {
      config.getOptional[String]("pg_cluster.properties.password")
    } flatMap {
      case Some(value) => Future.successful(value)
      case None        => Future.failed(new Error())
    }

    val x: Future[Future[Vector[Int]]] = for{
      server <- serverName
      port <- portNumber
      user <- userName
      password <- userPassword
    } yield {

      val dbURL = s"jdbc:postgresql://${server}:${port}/${dbName}?user=${user}&password=${password}"
      val db = Database.forURL(dbURL)
      val accessPublicSchemaStatement = sql"""GRANT CREATE,USAGE ON SCHEMA public TO public"""
      val f: Future[Vector[Int]] = db.run(accessPublicSchemaStatement.as[Int])
      Await.result(f, 5.second)
      db.close
      f
      /*
      f.onComplete {
        case Success(_) => db.close; Vector(1)
        case Failure(error) => db.close; Failure(new Error)
      }
      //db.close
      f*/

    }
    x
  }*/
}
