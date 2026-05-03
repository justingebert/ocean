package com.htwhub.ocean.concurrent

import org.apache.pekko.actor.ActorSystem
import javax.inject.Inject
import play.api.libs.concurrent.CustomExecutionContext

/** Provides custom execution contexts for database operations.
  *
  * Control exactly how much of which types of operations your application does at once
  * @see
  *   https://www.playframework.com/documentation/2.8.x/ThreadPools
  */
object DatabaseContexts {

  class SimpleDbLookupsContext @Inject() (actorSystem: ActorSystem)
      extends CustomExecutionContext(actorSystem, "database-contexts.simple-db-lookups")

  class ExpensiveDbLookupsContext @Inject() (actorSystem: ActorSystem)
      extends CustomExecutionContext(actorSystem, "database-contexts.expensive-db-lookups")

  class DbWriteOperationsContext @Inject() (actorSystem: ActorSystem)
      extends CustomExecutionContext(actorSystem, "database-contexts.db-write-operations")

  class ExpensiveCpuOperationsContext @Inject() (actorSystem: ActorSystem)
      extends CustomExecutionContext(actorSystem, "database-contexts.expensive-cpu-operations")
}
