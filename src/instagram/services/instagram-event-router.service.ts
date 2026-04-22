import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { EVENT_TYPE_MAP, InstagramEventType, InstagramEventPayload } from '../constants/events';
import { ROUTING_KEYS } from '../../rabbitmq/constants/queues';

@Injectable()
export class InstagramEventRouterService {
  private readonly logger = new Logger(InstagramEventRouterService.name);

  // Mapeo de InstagramEventType a ROUTING_KEYS
  private readonly eventTypeToRoutingKey: Record<InstagramEventType, string> = {
    [InstagramEventType.MESSAGE]: ROUTING_KEYS.INSTAGRAM_MESSAGE_RECEIVED,
    [InstagramEventType.COMMENT]: ROUTING_KEYS.INSTAGRAM_COMMENT_RECEIVED,
    [InstagramEventType.MESSAGE_REACTION]: ROUTING_KEYS.INSTAGRAM_REACTION_RECEIVED,
    [InstagramEventType.MESSAGING_SEEN]: ROUTING_KEYS.INSTAGRAM_SEEN_RECEIVED,
    [InstagramEventType.MESSAGING_REFERRAL]: ROUTING_KEYS.INSTAGRAM_REFERRAL_RECEIVED,
    [InstagramEventType.MESSAGING_OPTINS]: ROUTING_KEYS.INSTAGRAM_OPTIN_RECEIVED,
    [InstagramEventType.MESSAGING_HANDOVER]: ROUTING_KEYS.INSTAGRAM_HANDOVER_RECEIVED,
  };

  constructor(private readonly rabbitmq: RabbitMQService) {}

  /**
    * Identifica el tipo de evento basado en el field name y publica a la queue correcta
    * @param field - El nombre del campo del evento (ej: 'messages', 'comments', etc)
    * @param value - El payload completo del evento
    * @param entryTime - El timestamp del evento desde la entrada de Meta
    */
  route(field: string, value: any, entryTime: number): void {
    // Identificar el tipo de evento
    const eventType = EVENT_TYPE_MAP[field];

    if (!eventType) {
      this.logger.warn(`Unknown Instagram event field: ${field}. Skipping...`);
      return;
    }

    // Obtener la routing key para este tipo de evento
    const routingKey = this.eventTypeToRoutingKey[eventType];

    if (!routingKey) {
      this.logger.error(`No routing key configured for event type: ${eventType}`);
      return;
    }

    // Crear el payload normalizado
    const payload: InstagramEventPayload = {
      eventType,
      entryTime,
      value,
    };

    // Publicar a RabbitMQ
    this.rabbitmq.publish(routingKey, payload as unknown as Record<string, unknown>);
    this.logger.log(`Routed event [${eventType}] → [${routingKey}]`);

    // Publish conversation.incoming event for messages (similar to WhatsApp)
    if (eventType === InstagramEventType.MESSAGE) {
      this.publishConversationIncomingEvent(value, entryTime);
    }
  }

  /**
   * Publish conversation.incoming event when a user sends a message
   * This triggers conversation creation in the Instagram service
   */
  private async publishConversationIncomingEvent(messageData: any, entryTime: number): Promise<void> {
    try {
      // Extract message content
      const messages = messageData?.messages || [];
      if (!messages || messages.length === 0) return;

      const message = messages[0];
      if (!message || !message.from) return;

      // Extract key fields
      const senderId = message.from; // The user's IGSID
      const messageId = message.id;
      const messageText = message.text?.text || '[Non-text message]';
      const timestamp = message.timestamp || String(entryTime); // Unix timestamp as string

      // Extract media URL if present
      let mediaUrl: string | null = null;
      let mediaType: string | null = null;

      if (message.image?.url) {
        mediaUrl = message.image.url;
        mediaType = 'image';
      } else if (message.video?.url) {
        mediaUrl = message.video.url;
        mediaType = 'video';
      } else if (message.audio?.url) {
        mediaUrl = message.audio.url;
        mediaType = 'audio';
      } else if (message.file?.url) {
        mediaUrl = message.file.url;
        mediaType = 'file';
      } else if (message.sticker?.url) {
        mediaUrl = message.sticker.url;
        mediaType = 'sticker';
      }

      // Publish conversation.incoming event
      const conversationPayload: Record<string, unknown> = {
        channel: 'instagram',
        channelUserId: senderId,
        messageText,
        messageId,
        timestamp, // Unix timestamp as string
      };

      if (mediaUrl) {
        conversationPayload.mediaUrl = mediaUrl;
        conversationPayload.mediaType = mediaType;
      }

      this.rabbitmq.publish(ROUTING_KEYS.CONVERSATION_INCOMING, conversationPayload);
      this.logger.log(`Published conversation.incoming event for user ${senderId}${mediaUrl ? ` (media: ${mediaType})` : ''}`);
    } catch (error) {
      this.logger.error('Failed to publish conversation.incoming event', error);
      // Don't throw, just log - conversation creation is secondary
    }
  }
}
