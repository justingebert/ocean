# Getting Started with Play

## Available Scripts

In the project directory, you can run:

### `sbt run -Dconfig.resource=application.dev.conf`
Runs the app in the development mode.

### `sbt run -Dplay.http.secret.key='SECRET KEY' -Djwt.secret_key='SECRET KEY'`
Runs the app in the staging mode.

### `sbt test`
Launches the test runner

### `sbt cov`
Generates coverage reports.

### `sbt format`
Runs the formatter.


### `sbt dist`
Builds the app for production

## Build With

* [SBT](https://www.scala-sbt.org/) Build and dependency management
* [Play](https://www.playframework.com/)  Web Framework
* [Slick](http://slick.lightbend.com/) Database query and access library
* [ScalaTest](http://www.scalatest.org/) Unit-testing framework
* [ScalaMock](https://scalamock.org/) Unit-testing framework
* [Swagger](https://github.com/swagger-api/swagger-play)  Interface Description Language for describing RESTful APIs
