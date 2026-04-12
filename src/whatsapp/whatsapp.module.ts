import { Module } from '@nestjs/common';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { WhatsappEventRouterService } from './services/whatsapp-event-router.service';
import { ScrapingMessageInterceptor } from './services/scraping-message.interceptor';

@Module({
  imports: [RabbitMQModule],
  providers: [WhatsappEventRouterService, ScrapingMessageInterceptor],
  exports: [WhatsappEventRouterService],
})
export class WhatsappModule {}
