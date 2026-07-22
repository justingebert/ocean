import play.sbt.PlayImport._
import sbt._

object Dependencies {

  object Version {
    // compile
    val directory = "2.0.2"
    val h2 = "1.4.200"
    val postgresql = "42.7.11"
    val mongodb = "5.5.1"
    val slick = "6.1.0"
    val slickEvolution = "6.1.0"
    val jwtCore = "8.0.2"
    val jwtPlay = "8.0.2"
    val logBack = "6.6"
    val jackson = "2.12.2"
    val swaggerAnnotations = "1.6.12"
    val swaggerUi = "5.32.8"

    // test
    val scalaTest = "3.2.19"
    val scalaTestPlusMockito = "3.2.19.0"
  }

  val compile = Seq(
    guice,
    "org.apache.directory.api" % "api-all" % Version.directory,
    "com.h2database" % "h2" % Version.h2,
    "org.postgresql" % "postgresql" % Version.postgresql,
    "org.mongodb.scala" %% "mongo-scala-driver" % Version.mongodb,
    "org.playframework" %% "play-slick" % Version.slick,
    "org.playframework" %% "play-slick-evolutions" % Version.slickEvolution,
    "com.github.jwt-scala" %% "jwt-core" % Version.jwtCore,
    "com.github.jwt-scala" %% "jwt-play-json" % Version.jwtPlay,
    "net.logstash.logback" % "logstash-logback-encoder" % Version.logBack,
    "com.fasterxml.jackson.module" %% "jackson-module-scala" % Version.jackson,
    "io.swagger" % "swagger-annotations" % Version.swaggerAnnotations,
    "org.webjars" % "swagger-ui" % Version.swaggerUi,
  )

  val test: Seq[ModuleID] = Seq(
    "org.scalatest" %% "scalatest" % Version.scalaTest,
    "org.scalatestplus" %% "mockito-5-18" % Version.scalaTestPlusMockito,
  ).map(_ % "test")

  val all: Seq[ModuleID] = compile ++ test
}
