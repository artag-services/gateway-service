import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { RabbitMQModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [PrismaModule, RabbitMQModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
