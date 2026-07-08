package com.htwhub.ocean.managers

import play.api.Logger
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

/** Saga helper for operations that span the internal ORM DB and a managed cluster.
  *
  * These two systems cannot share a single transaction, so we approximate atomicity with compensation:
  * if `step` fails, run a best-effort `compensate` that undoes what earlier steps created, then rethrow the original error.
  * Compensations must be idempotent!
  */
object Saga {

  private val logger: Logger = Logger(this.getClass)

  def withCompensation[T](step: Future[T])(compensate: => Future[Any])(implicit ec: ExecutionContext): Future[T] =
    step.recoverWith { case error: Throwable =>
      compensate
        .recoverWith { case compensationError: Throwable =>
          // Compensation itself failed: we may now have dangling state
          // this could be fixed by cleanup pass or cron job, but left out since this is out of scope
          logger.error(
            s"Compensation failed, possible dangling state: ${compensationError.getMessage}",
            compensationError
          )
          Future.successful(())
        }
        .flatMap(_ => Future.failed(error))
    }
}
