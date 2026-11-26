package com.htwhub.ocean.cleanup

import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime
import javax.inject.Inject
import javax.inject.Singleton
import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.actor.Cancellable
import play.api.inject.ApplicationLifecycle
import play.api.Configuration
import play.api.Logger
import scala.concurrent.duration.DurationLong
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

/** Runs [[CleanupJob]] once per day at 20:00 Berlin time, if `ocean.cleanup.enabled`. */
@Singleton
class CleanupScheduler @Inject() (
  cleanupConfig: CleanupConfig,
  cleanupJob: CleanupJob,
  config: Configuration,
  actorSystem: ActorSystem,
  lifecycle: ApplicationLifecycle
)(implicit ec: ExecutionContext) {

  val logger: Logger = Logger(this.getClass)

  @volatile private var next: Option[Cancellable] = None
  @volatile private var stopped = false

  if (!cleanupConfig.enabled) {
    logger.info("Database cleanup disabled (ocean.cleanup.enabled = false)")
  } else if (config.get[Boolean]("play.mailer.mock")) {
    logger.error("Database cleanup not started: it needs real mail, set OCEAN_MAIL_MOCK=false")
  } else {
    lifecycle.addStopHook { () =>
      stopped = true
      next.foreach(_.cancel())
      Future.unit
    }
    scheduleAfter(ZonedDateTime.now(CleanupScheduler.zone))
  }

  private def scheduleAfter(after: ZonedDateTime): Unit =
    if (!stopped) {
      val runAt = CleanupScheduler.nextRunAfter(after)
      val delay = Duration.between(ZonedDateTime.now(CleanupScheduler.zone), runAt).toMillis.max(0).millis
      logger.info(s"Next database cleanup at $runAt")
      next = Some(actorSystem.scheduler.scheduleOnce(delay)(run(runAt)))
    }

  private def run(plannedAt: ZonedDateTime): Unit = {
    logger.info("Database cleanup started")
    // delegate turns a synchronous throw into a failed Future, so the recover below still plans the next run.
    Future
      .delegate(cleanupJob.run(Instant.now))
      .map(_ => logger.info("Database cleanup finished"))
      .recover { case t: Throwable => logger.error("Database cleanup failed", t) }
      // Plan from whichever is later, so a timer firing early can't repeat today's run.
      .foreach { _ =>
        val now = ZonedDateTime.now(CleanupScheduler.zone)
        scheduleAfter(if (now.isAfter(plannedAt)) now else plannedAt)
      }
  }
}

object CleanupScheduler {
  val zone: ZoneId = ZoneId.of("Europe/Berlin")
  val runTime: LocalTime = LocalTime.of(20, 0)

  /** The first daily run strictly after `after`. */
  def nextRunAfter(after: ZonedDateTime): ZonedDateTime = {
    val local = after.withZoneSameInstant(zone)
    val sameDay = local.toLocalDate.atTime(runTime).atZone(zone)
    if (sameDay.isAfter(local)) sameDay else local.toLocalDate.plusDays(1).atTime(runTime).atZone(zone)
  }

  /** Date of the first daily run at or after `instant`, i.e. the run that sees it as reached. */
  def firstRunDateFrom(instant: Instant): LocalDate = {
    val local = instant.atZone(zone)
    if (local.toLocalTime.isAfter(runTime)) local.toLocalDate.plusDays(1) else local.toLocalDate
  }
}
