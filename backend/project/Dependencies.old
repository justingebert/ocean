import play.sbt.PlayImport._
import sbt._

object Dependencies {

  object Version {
    // compile
    val directory = "2.0.2"
    val h2 = "1.4.200"
    val postgresql = "42.2.21"
    val mongodb = "2.9.0"
    val slick = "5.0.0"
    val slickEvolution = "5.0.0"
    val jwtCore = "8.0.2"
    val jwtPlay = "8.0.2"
    val logBack = "6.6"
    val jackson = "2.12.2"
    val swaggerPlay = "3.1.0"
    val swaggerCore = "1.6.2"
    val swaggerUi = "3.52.5"

    // test
    val scalaTest = "3.0.8"
    val mockito = "3.12.4"
  }

  val compile = Seq(
    guice,
    "org.apache.directory.api" % "api-all" % Version.directory,
    "com.h2database" % "h2" % Version.h2,
    "org.postgresql" % "postgresql" % Version.postgresql,
    "org.mongodb.scala" %% "mongo-scala-driver" % Version.mongodb,
    "com.typesafe.play" %% "play-slick" % Version.slick,
    "com.typesafe.play" %% "play-slick-evolutions" % Version.slickEvolution,
    "com.github.jwt-scala" %% "jwt-core" % Version.jwtCore,
    "com.github.jwt-scala" %% "jwt-play-json" % Version.jwtPlay,
    "net.logstash.logback" % "logstash-logback-encoder" % Version.logBack,
    "com.fasterxml.jackson.module" %% "jackson-module-scala" % Version.jackson,
    // see https://github.com/swagger-api/swagger-play/pull/220
    "com.github.dwickern" %% "swagger-play2.8" % Version.swaggerPlay,
    "io.swagger" % "swagger-core" % Version.swaggerCore,
    "org.webjars" % "swagger-ui" % Version.swaggerUi,
  )

  val test: Seq[ModuleID] = Seq(
    "org.scalatest" %% "scalatest" % Version.scalaTest,
    "org.mockito" % "mockito-core" % Version.mockito,
  ).map(_ % "test")

  val all: Seq[ModuleID] = compile ++ test
}
