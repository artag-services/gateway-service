import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { WebsocketModule } from './websocket/ws.module';
import { MessagesModule } from './v1/messages/messages.module';
import { IdentityModule } from './v1/identity/identity.module';
import { ScrapingModule } from './v1/scraping/scraping.module';
import { ConversationsModule } from './v1/conversations/conversations.module';
import { SchedulerModule } from './v1/scheduler/scheduler.module';
import { EmailModule } from './v1/email/email.module';
import { EventsModule } from './events/events.module';
import { WebhookModule } from './webhooks/webhook.module';
// import { AuthModule } from './auth/auth.module'; // TODO: activar cuando implementemos auth

@Module({
  imports: [
    // Variables de entorno disponibles en toda la app
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    PrismaModule,
    RabbitMQModule,
    WebsocketModule,

    // Módulos versionados
    MessagesModule,
    IdentityModule,
    ScrapingModule,
    ConversationsModule,
    SchedulerModule,
    EmailModule,
    EventsModule,
    WebhookModule,

    // TODO: AuthModule - descomentar cuando activemos autenticación
    // AuthModule,
  ],
})
export class AppModule {}
