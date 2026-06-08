name := "backend"

version := "1.0"

maintainer := "https://github.com/abteilung6"

lazy val `backend` = (project in file("."))
  .enablePlugins(PlayScala)
  .settings(
    libraryDependencies ++= Dependencies.all,
    inConfig(Test)(testSettings)
  )

resolvers += "Akka Snapshot Repository".at("https://repo.akka.io/snapshots/")

scalaVersion := "2.13.16"

lazy val testSettings = Seq(
  coverageEnabled := true
)

addCommandAlias("format", "scalafmt; test:scalafmt")
addCommandAlias("formatCheck", "scalafmtCheck; test:scalafmtCheck")
addCommandAlias("cov", "clean; coverage; test; coverageReport;")
