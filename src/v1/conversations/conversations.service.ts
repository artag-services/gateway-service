import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { ROUTING_KEYS } from '../../rabbitmq/constants/queues';
import { ConvStatus } from '@prisma/client';

interface ListOptions {
  channel?: string;
  status?: string;
  limit: number;
  offset: number;
}

interface GetMessagesOptions {
  limit: number;
  offset: number;
}

/**
 * Service for managing conversations across all channels
 * Handles: creation, querying, updating (AI toggle, agent assignment)
 */
@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    private prisma: PrismaService,
    private rabbitmq: RabbitMQService,
  ) {}

  /**
   * List all conversations with optional filtering
   */
  async listConversations(options: ListOptions) {
    const {channel, status, limit, offset} = options;

    const where: any = {};
    if (channel) where.channel = channel;
    if (status) where.status = status;

    try {
      const [conversations, total] =
        await this.prisma.$transaction([
          this.prisma.conversation.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: {lastMessageAt: 'desc'},
          }),
          this.prisma.conversation.count({where}),
        ]);

      this.logger.debug(
        `Listed ${conversations.length} conversations (total: ${total})`,
      );

      return {
        data: conversations,
        total,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error('Error listing conversations:', error);
      throw error;
    }
  }

  /**
   * Get single conversation by ID
   */
  async getConversationById(conversationId: string) {
    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: {id: conversationId},
      });

      if (!conversation) {
        throw new NotFoundException(
          `Conversation ${conversationId} not found`,
        );
      }

      return conversation;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error getting conversation:', error);
      throw error;
    }
  }

  /**
   * Get messages in conversation
   * Note: This is a placeholder - actual messages are stored in service-specific DBs
   */
  async getConversationMessages(
    conversationId: string,
    options: GetMessagesOptions,
  ) {
    try {
      // Verify conversation exists
      await this.getConversationById(conversationId);

      // TODO: In a real implementation, this would query the service-specific DB
      // based on conversation.channel (whatsapp_db, instagram_db, etc)
      // For now, return placeholder

      this.logger.debug(
        `Getting messages for conversation ${conversationId} (limit: ${options.limit}, offset: ${options.offset})`,
      );

      return {
        conversationId,
        messages: [],
        total: 0,
        limit: options.limit,
        offset: options.offset,
        note: 'Message storage is in service-specific databases. Call service endpoints for actual messages.',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error getting conversation messages:', error);
      throw error;
    }
  }

  /**
   * Create new conversation manually
   */
  async createConversation(data: {
    channel: string;
    channelUserId?: string;
    topic?: string;
    aiEnabled?: boolean;
  }) {
    try {
      if (!data.channel) {
        throw new BadRequestException('Channel is required');
      }

      const conversation = await this.prisma.conversation.create({
        data: {
          channel: data.channel,
          channelUserId: data.channelUserId || `manual_${Date.now()}`,
          topic: data.topic || 'General',
          detectionMethod: 'MANUAL',
          keywords: [],
          aiEnabled: data.aiEnabled ?? true,
          status: 'ACTIVE',
        },
      });

      this.logger.log(
        `✅ Conversation created manually: ${conversation.id}`,
      );

      // Publish event so services can react
      await this.rabbitmq.publish(ROUTING_KEYS.CONVERSATION_CREATED, {
        conversationId: conversation.id,
        channel: conversation.channel,
        channelUserId: conversation.channelUserId,
        topic: conversation.topic,
        aiEnabled: conversation.aiEnabled,
        createdAt: new Date().toISOString(),
      } as unknown as Record<string, unknown>);

      return {
        conversationId: conversation.id,
        created: true,
      };
    } catch (error) {
      this.logger.error('Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Update conversation: AI toggle, agent assignment, status
   */
  async updateConversation(
    conversationId: string,
    updates: {
      aiEnabled?: boolean;
      agentAssigned?: string;
      status?: ConvStatus;
    },
  ) {
    try {
      // Verify exists
      const existing = await this.getConversationById(conversationId);

      const updated = await this.prisma.conversation.update({
        where: {id: conversationId},
        data: {
          aiEnabled: updates.aiEnabled ?? existing.aiEnabled,
          agentAssigned: updates.agentAssigned ?? existing.agentAssigned,
          status: updates.status ?? existing.status,
          updatedAt: new Date(),
        },
      });

      this.logger.log(
        `✅ Conversation updated: ${conversationId} | aiEnabled: ${updated.aiEnabled}, agentAssigned: ${updated.agentAssigned}`,
      );

      // Publish events for services to react
      if (updates.aiEnabled !== undefined) {
        await this.rabbitmq.publish(ROUTING_KEYS.CONVERSATION_AI_TOGGLE, {
          conversationId,
          aiEnabled: updates.aiEnabled,
        } as unknown as Record<string, unknown>);
      }

      if (updates.agentAssigned !== undefined) {
        await this.rabbitmq.publish(ROUTING_KEYS.CONVERSATION_AGENT_ASSIGN, {
          conversationId,
          agentAssigned: updates.agentAssigned,
        } as unknown as Record<string, unknown>);
      }

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error updating conversation:', error);
      throw error;
    }
  }

  /**
   * Archive conversation (soft delete)
   */
  async archiveConversation(conversationId: string) {
    try {
      // Verify exists
      await this.getConversationById(conversationId);

      const archived = await this.prisma.conversation.update({
        where: {id: conversationId},
        data: {
          status: 'ARCHIVED',
          archivedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(
        `✅ Conversation archived: ${conversationId}`,
      );

      return {
        conversationId: archived.id,
        archived: true,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error archiving conversation:', error);
      throw error;
    }
  }
}
