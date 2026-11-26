package com.htwhub.ocean.cleanup

import com.htwhub.ocean.models.Instance
import com.htwhub.ocean.models.Instance.PostgreSQLEngineType
import com.htwhub.ocean.models.User
import java.time.format.DateTimeFormatter
import java.time.LocalDate
import javax.inject.Inject
import javax.inject.Singleton
import play.api.libs.mailer.Email
import play.api.libs.mailer.MailerClient
import play.api.Configuration
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

/** Plain-text expiry mails to a database owner, German first, then English. Settings in `conf/mail.conf`. */
@Singleton
class ExpiryMailer @Inject() (mailerClient: MailerClient, config: Configuration)(implicit ec: ExecutionContext) {

  private val from = config.get[String]("ocean.mail.from")
  private val appUrl = config.get[String]("ocean.mail.app-url").stripSuffix("/")
  private val dateFormat = DateTimeFormatter.ofPattern("dd.MM.yyyy")

  def sendReminder(instance: Instance, owner: User, deletionDate: LocalDate): Future[Unit] = {
    val date = dateFormat.format(deletionDate)
    val (engine, exportTool) = engineNames(instance)
    val link = s"$appUrl/databases/${instance.id.value}"
    send(
      owner,
      s"Ocean: Datenbank ${instance.name} wird am $date gelöscht / Database ${instance.name} will be deleted on $date",
      s"""Hallo ${owner.firstName} ${owner.lastName},
         |
         |Ihre $engine-Datenbank "${instance.name}" in Ocean läuft ab und wird am $date gelöscht.
         |
         |Wenn Sie sie weiter brauchen, verlängern Sie sie in Ocean:
         |$link
         |
         |Sonst müssen Sie nichts tun. Um die Daten zu behalten, exportieren Sie sie vorher mit $exportTool
         |und den Verbindungsdaten von der Seite oben.
         |
         |---
         |
         |Hello ${owner.firstName} ${owner.lastName},
         |
         |your $engine database "${instance.name}" in Ocean is expiring and will be deleted on $date.
         |
         |If you still need it, renew it in Ocean:
         |$link
         |
         |Otherwise there is nothing to do. To keep the data, export it first with $exportTool
         |and the connection details from the page above.
         |""".stripMargin
    )
  }

  def sendDeleted(instance: Instance, owner: User): Future[Unit] = {
    val (engine, _) = engineNames(instance)
    send(
      owner,
      s"Ocean: Datenbank ${instance.name} gelöscht / Database ${instance.name} deleted",
      s"""Hallo ${owner.firstName} ${owner.lastName},
         |
         |Ihre $engine-Datenbank "${instance.name}" in Ocean ist abgelaufen und wurde gelöscht,
         |zusammen mit ihren Rollen und Einladungen. Eine neue Datenbank können Sie jederzeit anlegen:
         |$appUrl
         |
         |---
         |
         |Hello ${owner.firstName} ${owner.lastName},
         |
         |your $engine database "${instance.name}" in Ocean has expired and was deleted,
         |together with its roles and invitations. You can create a new database at any time:
         |$appUrl
         |""".stripMargin
    )
  }

  private def engineNames(instance: Instance): (String, String) =
    if (instance.engine == PostgreSQLEngineType) ("PostgreSQL", "pg_dump") else ("MongoDB", "mongodump")

  private def send(owner: User, subject: String, body: String): Future[Unit] =
    Future {
      mailerClient.send(Email(subject, from, Seq(owner.mail), bodyText = Some(body)))
      ()
    }
}
