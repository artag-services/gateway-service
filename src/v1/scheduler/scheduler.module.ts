import { Module } from '@nestjs/common';
import { RabbitMQModule } from '../../rabbitmq/rabbitmq.module';
import { RequestResponseManager } from '../../identity/services/request-response.manager';
import { SchedulerResponseListener } from '../../scheduler/services/scheduler-response.listener';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';

/**
 * Scheduler integration on the gateway. The RequestResponseManager is
 * provided here as a fresh instance scoped to scheduler responses (separate
 * from the identity one), so promise resolution doesn't cross-contaminate.
 */
@Module({
  imports: [RabbitMQModule],
  providers: [RequestResponseManager, SchedulerResponseListener, SchedulerService],
  controllers: [SchedulerController],
})
export class SchedulerModule {}
