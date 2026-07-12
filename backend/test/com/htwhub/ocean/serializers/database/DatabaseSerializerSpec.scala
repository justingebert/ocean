package com.htwhub.ocean.serializers.database

import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec

class DatabaseSerializerSpec extends AnyWordSpec with Matchers {

  "database name validation" should {
    "accept a one-character lowercase name" in {
      val data = Map("name" -> "a", "engine" -> "P")

      CreateDatabaseSerializer.constraints.bind(data).hasErrors shouldBe false
      AvailabilityDatabaseSerializer.constraints.bind(data).hasErrors shouldBe false
    }

    "reject a name longer than 32 characters" in {
      val data = Map("name" -> ("a" * 33), "engine" -> "P")

      CreateDatabaseSerializer.constraints.bind(data).hasErrors shouldBe true
      AvailabilityDatabaseSerializer.constraints.bind(data).hasErrors shouldBe true
    }
  }
}
