import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Logger,
} from '@nestjs/common';
import { ConvStatus } from '@prisma/client';
import { ConversationsService } from './conversations.service';

/**
 * Conversation lifecycle endpoints. Writes only — list/get/messages have
 * moved to the unified read model:
 *
 *   GET /v1/query/conversations              — list (filter ?channel, ?status)
 *   GET /v1/query/conversations/:id          — single (cross-channel summary)
 *   GET /v1/query/conversations/:id/messages — messages
 *   GET /v1/query/users/:userId/conversations
 *
 * For the agent's deeper view (messages WITH tool blocks), use
 * `GET /v1/agent/conversations/:id` instead.
 */
@Controller('v1/conversations')
export class ConversationsController {
  private readonly logger = new Logger(ConversationsController.name);

  constructor(private conversationsService: ConversationsService) {}

  @Post()
  async createConversation(
    @Body()
    data: {
      channel: string;
      channelUserId?: string;
      topic?: string;
      aiEnabled?: boolean;
    },
  ) {
    this.logger.log(`Creating conversation for channel: ${data.channel}`);
    return this.conversationsService.createConversation(data);
  }

  /** Update aiEnabled / agentAssigned / status — fans out to the producer
   *  service via RabbitMQ; the producer also re-emits the CQRS snapshot. */
  @Patch(':conversationId')
  async updateConversation(
    @Param('conversationId') conversationId: string,
    @Body()
    updates: {
      aiEnabled?: boolean;
      agentAssigned?: string;
      status?: ConvStatus;
    },
  ) {
    this.logger.log(`Updating conversation: ${conversationId}`);
    return this.conversationsService.updateConversation(conversationId, updates);
  }

  /** Soft-archive. */
  @Delete(':conversationId')
  async archiveConversation(@Param('conversationId') conversationId: string) {
    this.logger.log(`Archiving conversation: ${conversationId}`);
    return this.conversationsService.archiveConversation(conversationId);
  }
}
