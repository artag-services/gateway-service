import { Module } from '@nestjs/common'
import { ScrapingController } from './scraping.controller'
import { ScrapingService } from './scraping.service'
import { RabbitMQModule } from '../../rabbitmq/rabbitmq.module'
import { MessagesModule } from '../messages/messages.module'
import { RequestResponseManager } from '../../identity/services/request-response.manager'
import { ScrapingResponseListener } from './services/scraping-response.listener'

@Module({
  imports: [RabbitMQModule, MessagesModule],
  controllers: [ScrapingController],
  providers: [
    RequestResponseManager,
    ScrapingService,
    ScrapingResponseListener,
  ],
  exports: [ScrapingService],
})
export class ScrapingModule {}
