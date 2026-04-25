import { Module } from '@nestjs/common';
import { InstagramWebhookController } from './instagram.webhook.controller';
import { WhatsappWebhookController } from './whatsapp.webhook.controller';
import { NotionWebhookController } from './notion.webhook.controller';
import { SlackWebhookController } from './slack.webhook.controller';
import { ResendWebhookController } from './resend.webhook.controller';
import { InstagramModule } from '../instagram/instagram.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { NotionModule } from '../notion/notion.module';
import { SlackModule } from '../slack/slack.module';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [InstagramModule, WhatsappModule, NotionModule, SlackModule, RabbitMQModule],
  controllers: [
    InstagramWebhookController,
    WhatsappWebhookController,
    NotionWebhookController,
    SlackWebhookController,
    ResendWebhookController,
  ],
})
export class WebhookModule {}
