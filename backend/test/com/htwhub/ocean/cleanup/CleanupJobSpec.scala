package com.htwhub.ocean.cleanup

import com.htwhub.ocean.cleanup.CleanupJob.Delete
import com.htwhub.ocean.cleanup.CleanupJob.Remind
import com.htwhub.ocean.managers.DatabaseManager
import com.htwhub.ocean.models.Instance
import com.htwhub.ocean.models.Instance.PostgreSQLEngineType
import com.htwhub.ocean.models.InstanceId
import com.htwhub.ocean.models.User
import com.htwhub.ocean.models.UserId
import com.htwhub.ocean.service.InstanceService
import com.htwhub.ocean.service.UserService
import java.sql.Timestamp
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.ZonedDateTime
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.anyLong
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.when
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AsyncWordSpec
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.mailer.Email
import play.api.libs.mailer.MailerClient
import play.api.Configuration
import scala.concurrent.Future

class CleanupJobSpec extends AsyncWordSpec with Matchers with MockitoSugar {

  // 20:00 Berlin, when the daily run starts
  val now: Instant = Instant.parse("2026-12-01T19:00:00Z")
  val reminderDays: Seq[Int] = Seq(30, 7, 1)
  val owner: User = User(UserId(1), "owner", "Ada", "Lovelace", "ada@htw-berlin.de", "Student")

  def instance(id: Long, expiresInDays: Option[Long], remindersSent: Int): Instance =
    Instance(
      InstanceId(id),
      owner.id,
      s"db$id",
      PostgreSQLEngineType,
      Timestamp.from(now.minus(Duration.ofDays(200))),
      expiresInDays.map(days => Timestamp.from(now.plus(Duration.ofDays(days)))),
      remindersSent
    )

  "nextStep" should {
    "do nothing for a database that never expires" in {
      CleanupJob.nextStep(instance(1, None, 0), now, reminderDays) shouldBe None
    }
    "do nothing before the first reminder is due" in {
      CleanupJob.nextStep(instance(1, Some(31), 0), now, reminderDays) shouldBe None
    }
    "remind once a threshold is reached" in {
      CleanupJob.nextStep(instance(1, Some(30), 0), now, reminderDays) shouldBe Some(Remind)
      CleanupJob.nextStep(instance(1, Some(7), 1), now, reminderDays) shouldBe Some(Remind)
    }
    "wait for the next threshold after a reminder" in {
      CleanupJob.nextStep(instance(1, Some(20), 1), now, reminderDays) shouldBe None
    }
    "send a missing reminder instead of deleting" in {
      CleanupJob.nextStep(instance(1, Some(-5), 2), now, reminderDays) shouldBe Some(Remind)
    }
    "delete once expired and every reminder is sent" in {
      CleanupJob.nextStep(instance(1, Some(1), 3), now, reminderDays) shouldBe None
      CleanupJob.nextStep(instance(1, Some(0), 3), now, reminderDays) shouldBe Some(Delete)
    }
  }

  "deletionDate" should {
    "be the expiry date when reminders are on schedule" in {
      val db = instance(1, Some(30), 0)
      CleanupJob.deletionDate(db, now, reminderDays) shouldBe LocalDate.of(2026, 12, 31)
    }
    "be the day after when it expires after that day's run" in {
      val db = instance(1, Some(30), 0).copy(expiresAt = Some(Timestamp.from(Instant.parse("2026-12-31T20:00:00Z"))))
      CleanupJob.deletionDate(db, now, reminderDays) shouldBe LocalDate.of(2027, 1, 1)
    }
    "leave one daily run per remaining reminder when they are behind" in {
      CleanupJob.deletionDate(instance(1, Some(-5), 0), now, reminderDays) shouldBe LocalDate.of(2026, 12, 4)
    }
  }

  "run" should {
    "remind the owner and count the reminder" in {
      val db = instance(1, Some(30), 0)
      val (job, instanceService, _, mailer) = createJob(Seq(db))

      job.run(now).map { _ =>
        verify(mailer).sendReminder(db, owner, LocalDate.of(2026, 12, 31))
        verify(instanceService).incrementRemindersSent(db)
        succeed
      }
    }

    "not count a reminder whose mail failed, and carry on with the next database" in {
      val failing = instance(1, Some(30), 0)
      val next = instance(2, Some(7), 1)
      val (job, instanceService, _, mailer) = createJob(Seq(failing, next))
      when(mailer.sendReminder(any[Instance], any[User], any[LocalDate]))
        .thenReturn(Future.failed(new RuntimeException("relay down")))
        .thenReturn(Future.unit)

      job.run(now).map { _ =>
        verify(instanceService, never()).incrementRemindersSent(failing)
        verify(instanceService).incrementRemindersSent(next)
        succeed
      }
    }

    "delete an expired database and confirm it to the owner" in {
      val db = instance(1, Some(-1), 3)
      val (job, _, databaseManager, mailer) = createJob(Seq(db))

      job.run(now).map { _ =>
        verify(databaseManager).deleteDatabase(db.id, owner)
        verify(mailer).sendDeleted(db, owner)
        succeed
      }
    }

    "not delete a database that was renewed after the run started" in {
      val db = instance(1, Some(-1), 3)
      val (job, instanceService, databaseManager, _) = createJob(Seq(db))
      val renewed = db.copy(expiresAt = Some(Timestamp.from(now.plus(Duration.ofDays(180)))), remindersSent = 0)
      when(instanceService.getUserInstanceById(db.id, db.userId)).thenReturn(Future.successful(renewed))

      job.run(now).map { _ =>
        verify(databaseManager, never()).deleteDatabase(InstanceId(anyLong()), any[User])
        succeed
      }
    }

    "not confirm a deletion that failed" in {
      val db = instance(1, Some(-1), 3)
      val (job, _, databaseManager, mailer) = createJob(Seq(db))
      when(databaseManager.deleteDatabase(InstanceId(anyLong()), any[User]))
        .thenReturn(Future.failed(new RuntimeException("cluster down")))

      job.run(now).map { _ =>
        verify(mailer, never()).sendDeleted(any[Instance], any[User])
        succeed
      }
    }
  }

  "ExpiryMailer" should {
    "send the reminder to the owner with the deletion date and a link to the database" in {
      var sent: Option[Email] = None
      val mailerClient = new MailerClient {
        def send(email: Email): String = { sent = Some(email); "id" }
      }
      val config = Configuration("ocean.mail.from" -> "Ocean <ocean@test>", "ocean.mail.app-url" -> "https://ocean/")
      val mailer = new ExpiryMailer(mailerClient, config)

      mailer.sendReminder(instance(42, Some(30), 0), owner, LocalDate.of(2026, 12, 31)).map { _ =>
        val email = sent.get
        email.to shouldBe Seq(owner.mail)
        email.subject should include("31.12.2026")
        email.bodyText.get should include("https://ocean/databases/42")
        email.bodyText.get should include("pg_dump")
      }
    }
  }

  "CleanupScheduler.nextRunAfter" should {
    val zone = CleanupScheduler.zone
    "pick 20:00 the same day, or the next day once past" in {
      CleanupScheduler.nextRunAfter(ZonedDateTime.of(2026, 12, 1, 1, 0, 0, 0, zone)) shouldBe
        ZonedDateTime.of(2026, 12, 1, 20, 0, 0, 0, zone)
      CleanupScheduler.nextRunAfter(ZonedDateTime.of(2026, 12, 1, 20, 0, 0, 0, zone)) shouldBe
        ZonedDateTime.of(2026, 12, 2, 20, 0, 0, 0, zone)
    }
    "stay at 20:00 across a daylight saving change" in {
      val next = CleanupScheduler.nextRunAfter(ZonedDateTime.of(2027, 3, 27, 20, 0, 0, 0, zone))
      next shouldBe ZonedDateTime.of(2027, 3, 28, 20, 0, 0, 0, zone)
      Duration.between(ZonedDateTime.of(2027, 3, 27, 20, 0, 0, 0, zone), next) shouldBe Duration.ofHours(23)
    }
  }

  private def createJob(instances: Seq[Instance]) = {
    val instanceService = mock[InstanceService]
    when(instanceService.getExpiringInstances).thenReturn(Future.successful(instances))
    instances.foreach { i =>
      when(instanceService.getUserInstanceById(i.id, i.userId)).thenReturn(Future.successful(i))
    }
    when(instanceService.incrementRemindersSent(any[Instance])).thenReturn(Future.successful(1))
    val userService = mock[UserService]
    when(userService.getUserById(UserId(anyLong()))).thenReturn(Future.successful(owner))
    val databaseManager = mock[DatabaseManager]
    when(databaseManager.deleteDatabase(InstanceId(anyLong()), any[User])).thenReturn(Future.successful(List(1)))
    val mailer = mock[ExpiryMailer]
    when(mailer.sendReminder(any[Instance], any[User], any[LocalDate])).thenReturn(Future.unit)
    when(mailer.sendDeleted(any[Instance], any[User])).thenReturn(Future.unit)
    val cleanupConfig = new CleanupConfig(
      Configuration(
        "ocean.cleanup.lifetime-days" -> 180,
        "ocean.cleanup.reminder-days" -> reminderDays,
        "ocean.cleanup.enabled" -> true
      )
    )
    val job = new CleanupJob(cleanupConfig, instanceService, userService, databaseManager, mailer)
    (job, instanceService, databaseManager, mailer)
  }
}
