package com.htwhub.ocean.cleanup

import java.sql.Timestamp
import java.time.Duration
import java.time.Instant
import javax.inject.Inject
import javax.inject.Singleton
import play.api.Configuration

/** Settings for managed database expiry, from `conf/cleanup.conf`. */
@Singleton
class CleanupConfig @Inject() (config: Configuration) {

  val enabled: Boolean = config.get[Boolean]("ocean.cleanup.enabled")

  val lifetime: Duration = Duration.ofDays(config.get[Int]("ocean.cleanup.lifetime-days"))

  val reminderDays: Seq[Int] = config.get[Seq[Int]]("ocean.cleanup.reminder-days").sorted.reverse

  /** Expiry date for a database created or renewed at `now`. */
  def expiresAtFrom(now: Instant): Timestamp = Timestamp.from(now.plus(lifetime))
}
