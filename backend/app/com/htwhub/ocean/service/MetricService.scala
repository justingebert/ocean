package com.htwhub.ocean.service

import com.htwhub.ocean.models.Metric
import com.htwhub.ocean.models.User
import com.htwhub.ocean.repositories.InstanceRepository
import com.htwhub.ocean.repositories.UserRepository
import com.htwhub.ocean.service.exceptions.ServiceException
import com.htwhub.ocean.service.MetricService.Exceptions.AccessDenied
import javax.inject.Inject
import play.api.Logger
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

class MetricService @Inject() (instanceRepository: InstanceRepository, userRepository: UserRepository)(implicit
  ec: ExecutionContext
) {

  val logger: Logger = Logger(this.getClass)

  def getMetrics(user: User): Future[Metric] = {
    val callback = () =>
      for {
        totalInstances <- instanceRepository.countInstances()
        totalUsers <- userRepository.countUsers()
      } yield Metric(totalInstances, totalUsers)

    this.withPrivilegeOrFail[Metric](user, callback)
  }

  def withPrivilegeOrFail[R](user: User, callback: () => Future[R]): Future[R] =
    user.employeeType match {
      case string: String if string.contains("Staff") => callback()
      case _               => Future.failed(AccessDenied())
    }
}

object MetricService {
  object Exceptions {
    sealed abstract class MetricServiceException(message: String) extends ServiceException(message)
    final case class AccessDenied(message: String = "Access denied.") extends MetricServiceException(message)
  }
}
