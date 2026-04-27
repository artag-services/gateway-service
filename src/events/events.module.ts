import { Module } from '@nestjs/common'
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module'
import { EventsController } from './events.controller'
import { EventsService } from './events.service'

/**
 * Generic Server-Sent Events module — reusable for ALL fire-and-forget
 * services (scraping, email, scheduler, future). Subscribes to lifecycle
 * routing keys on RabbitMQ and forwards to subscribed HTTP clients.
 */
@Module({
  imports: [RabbitMQModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
