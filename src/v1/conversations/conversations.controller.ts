import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ConvStatus } from '@prisma/client';
import { ConversationsService } from './conversations.service';

/**
 * Gateway Conversations Endpoints
 * Manages conversation lifecycle: create, list, update, delete
 */
@Controller('api/v1/conversations')
export class ConversationsController {
  private readonly logger = new Logger(ConversationsController.name);

  constructor(private conversationsService: ConversationsService) {}

  /**
   * GET /conversations
   * List all conversations (paginated)
   * Query: channel?, status?, limit=50, offset=0
   */
  @Get()
  async listConversations(
    @Query('channel') channel?: string,
    @Query('status') status?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    this.logger.debug(
      `Listing conversations: channel=${channel}, status=${status}`,
    );

    return this.conversationsService.listConversations({
      channel,
      status,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  }

  /**
   * GET /conversations/:conversationId
   * Get single conversation details
   */
  @Get(':conversationId')
  async getConversation(@Param('conversationId') conversationId: string) {
    this.logger.debug(`Getting conversation: ${conversationId}`);
    return this.conversationsService.getConversationById(conversationId);
  }

  /**
   * GET /conversations/:conversationId/messages
   * Get messages in conversation (queries service-specific DB)
   * Query: limit=50, offset=0
   */
  @Get(':conversationId/messages')
  async getConversationMessages(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    this.logger.debug(`Getting messages for conversation: ${conversationId}`);
    return this.conversationsService.getConversationMessages(conversationId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  }

  /**
   * POST /conversations
   * Manually create a new conversation
   * Body: {channel: string, topic?: string, aiEnabled?: boolean}
   */
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

  /**
   * PATCH /conversations/:conversationId
   * Update conversation: aiEnabled, agentAssigned, status
   * Body: {aiEnabled?: boolean, agentAssigned?: string, status?: string}
   */
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

  /**
   * DELETE /conversations/:conversationId
   * Archive conversation (soft delete)
   */
  @Delete(':conversationId')
  async archiveConversation(
    @Param('conversationId') conversationId: string,
  ) {
    this.logger.log(`Archiving conversation: ${conversationId}`);
    return this.conversationsService.archiveConversation(conversationId);
  }
}
