import { Module } from '@nestjs/common';
import { RabbitMQModule } from '../../rabbitmq/rabbitmq.module';
import { RequestResponseManager } from '../../identity/services/request-response.manager';
import { EmailResponseListener } from '../../email/services/email-response.listener';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

/**
 * Email integration on the gateway. Provides a fresh RequestResponseManager
 * scoped to email so promise resolution doesn't cross-contaminate with
 * other services using the same RPC pattern.
 */
@Module({
  imports: [RabbitMQModule],
  providers: [RequestResponseManager, EmailResponseListener, EmailService],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
