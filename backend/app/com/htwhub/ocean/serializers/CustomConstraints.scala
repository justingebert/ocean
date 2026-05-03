package com.htwhub.ocean.serializers

import com.htwhub.ocean.models.Instance.EngineType
import com.htwhub.ocean.models.Instance.MongoDBSQLEngineType
import com.htwhub.ocean.models.Instance.PostgreSQLEngineType
import play.api.data.validation.Constraint
import play.api.data.validation.Invalid
import play.api.data.validation.Valid
import play.api.data.validation.ValidationError
import play.api.data.validation.ValidationResult

object CustomConstraints {
  private val namePattern = "[a-z][a-z0-9_]*$"
  private val illegalWords =
    List(
      "system.", "config", "local", "internal", "admin", "root", "postgresql", "template0", "template1", "unique",
    )
  private val allowedEngineTypes: Seq[EngineType] = Seq(PostgreSQLEngineType, MongoDBSQLEngineType)

  val nameCheckConstraint: Constraint[String] = Constraint("constraints.nameCheckConstraint") { plainText =>
    val errors = plainText match {
      case word if !word.matches(namePattern) =>
        Seq(
          ValidationError(
            "Name must begin with a letter (a-z). Subsequent characters in a name can be letters, digits (0-9), or underscores."
          )
        )
      case word if illegalWords.contains(word) => Seq(ValidationError(s"Illegal word: $word"))
      case _                                   => Nil
    }
    processErrors(errors)
  }

  val engineCheckConstraint: Constraint[EngineType] = Constraint("constraints.engineCheckConstraint") { plainText =>
    val errors = plainText match {
      case engine if !allowedEngineTypes.contains(engine) => Seq(ValidationError(s"Invalid engine: $engine"))
      case _                                              => Nil
    }
    processErrors(errors)
  }

  private def processErrors(errors: Seq[ValidationError]): ValidationResult =
    if (errors.isEmpty) {
      Valid
    } else {
      Invalid(errors)
    }
}
