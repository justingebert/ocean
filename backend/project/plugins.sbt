logLevel := Level.Warn

resolvers += "Typesafe repository" at "https://repo.typesafe.com/typesafe/releases/"

addSbtPlugin("org.playframework" % "sbt-plugin" % "3.0.0")
	addSbtPlugin("com.github.dwickern" % "sbt-swagger-play" % "0.6.0")
addSbtPlugin("org.scalameta" % "sbt-scalafmt" % "2.4.6")
addSbtPlugin("org.scoverage" % "sbt-scoverage" % "2.2.2")
