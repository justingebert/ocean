package com.htwhub.ocean.cleanup

import com.htwhub.ocean.cleanup.CleanupJob.Delete
import com.htwhub.ocean.cleanup.CleanupJob.Remind
import com.htwhub.ocean.managers.DatabaseManager
import com.htwhub.ocean.models.Instance
import com.htwhub.ocean.service.InstanceService
import com.htwhub.ocean.service.UserService
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import javax.inject.Inject
import javax.inject.Singleton
import play.api.Logger
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

/** One run of the daily expiry cleanup: reminds owners of expiring databases and deletes expired ones. Runs from
  * [[CleanupScheduler]].
  */
@Singleton
class CleanupJob @Inject() (
  cleanupConfig: CleanupConfig,
  instanceService: InstanceService,
  userService: UserService,
  databaseManager: DatabaseManager,
  mailer: ExpiryMailer
)(implicit ec: ExecutionContext) {

  val logger: Logger = Logger(this.getClass)

  private val reminderDays = cleanupConfig.reminderDays

  /** Databases are handled one after another; a failure is logged and only skips that database until the next run. */
  def run(now: Instant): Future[Unit] =
    instanceService.getExpiringInstances.flatMap { instances =>
      instances.foldLeft(Future.unit)((previous, instance) => previous.flatMap(_ => process(instance, now)))
    }

  private def process(instance: Instance, now: Instant): Future[Unit] =
    (CleanupJob.nextStep(instance, now, reminderDays) match {
      case Some(Remind) => remind(instance, now)
      case Some(Delete) => delete(instance, now)
      case None         => Future.unit
    }).recover { case t: Throwable =>
      logger.error(s"Cleanup of database ${instance.name} (id ${instance.id.value}) failed, retrying next run", t)
    }

  /** The reminder count only goes up once the mail is out, so a failed send is retried on the next run. */
  private def remind(instance: Instance, now: Instant): Future[Unit] =
    for {
      owner <- userService.getUserById(instance.userId)
      _ <- mailer.sendReminder(instance, owner, CleanupJob.deletionDate(instance, now, reminderDays))
      _ <- instanceService.incrementRemindersSent(instance)
    } yield logger.info(
      s"Sent expiry reminder ${instance.remindersSent + 1} of ${reminderDays.size} for database ${instance.name}"
    )

  /** Rereads the database first: the run started from a snapshot, and the owner may have renewed it since. */
  private def delete(snapshot: Instance, now: Instant): Future[Unit] =
    instanceService.getUserInstanceById(snapshot.id, snapshot.userId).flatMap { instance =>
      if (!CleanupJob.nextStep(instance, now, reminderDays).contains(Delete)) {
        logger.info(s"Database ${instance.name} was renewed during cleanup, not deleting it")
        Future.unit
      } else
        for {
          owner <- userService.getUserById(instance.userId)
          _ <- databaseManager.deleteDatabase(instance.id, owner)
          _ = logger.info(s"Deleted expired database ${instance.name} of ${owner.username}")
          _ <- mailer.sendDeleted(instance, owner).recover { case t: Throwable =>
            logger.error(s"Deleted database ${instance.name}, but the confirmation mail failed", t)
          }
        } yield ()
    }
}

object CleanupJob {
  sealed trait Step
  case object Remind extends Step
  case object Delete extends Step

  /** At most one step per run: the next due reminder, or deletion once expired and every reminder is sent. */
  def nextStep(instance: Instance, now: Instant, reminderDays: Seq[Int]): Option[Step] =
    instance.expiresAt.map(_.toInstant).flatMap { expiresAt =>
      reminderDays.lift(instance.remindersSent) match {
        case Some(days) => Option.when(!now.isBefore(expiresAt.minus(Duration.ofDays(days))))(Remind)
        case None       => Option.when(!now.isBefore(expiresAt))(Delete)
      }
    }

  /** Date of the daily run that will delete the database, if the reminder due now goes out: the first run once it has
    * expired, or later when reminders are behind (job was off, mails failed), since the remaining ones still go out one
    * per run before deletion.
    */
  def deletionDate(instance: Instance, now: Instant, reminderDays: Seq[Int]): LocalDate = {
    val runsUntilDeletion = reminderDays.size - instance.remindersSent
    val earliest = now.atZone(CleanupScheduler.zone).toLocalDate.plusDays(runsUntilDeletion.toLong)
    val firstAfterExpiry = instance.expiresAt.map(t => CleanupScheduler.firstRunDateFrom(t.toInstant))
    firstAfterExpiry.filter(_.isAfter(earliest)).getOrElse(earliest)
  }
}
