import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { RabbitMQService } from '../../../rabbitmq/rabbitmq.service'
import { MessagesService } from '../../messages/messages.service'
import { ROUTING_KEYS, QUEUES } from '../../../rabbitmq/constants/queues'
import { ConfigService } from '@nestjs/config'

/**
 * Gateway: Listens for Notion responses and sends WhatsApp notifications
 * 
 * This listener receives responses from the Notion service after a page is created.
 * When successful, it sends a WhatsApp notification to the user via the MessagesService.
 * 
 * Flow:
 * 1. Notion service creates a page
 * 2. Notion publishes to channels.scrapping.notion-response
 * 3. This listener receives the message
 * 4. If SUCCESS, send WhatsApp notification to user via MessagesService
 * 5. If FAILED, just log the error
 * 
 * NOTE: This replaces the previous behavior where Scraping Service handled this directly
 */
@Injectable()
export class ScrapingResponseListener implements OnModuleInit {
  private readonly logger = new Logger(ScrapingResponseListener.name)
  private readonly personalWhatsappNumber: string

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly messagesService: MessagesService,
    private readonly configService: ConfigService,
  ) {
    this.personalWhatsappNumber = this.configService.get('PERSONAL_WHATSAPP_NUMBER', '573205711428')
    this.logger.log(`ScrapingResponseListener initialized`)
    this.logger.log(`   - Will send notifications to: ${this.personalWhatsappNumber}`)
  }

  /**
   * Auto-subscribe to Notion response queue when module initializes
   */
  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('🚀 ScrapingResponseListener initializing...')

      // Subscribe to Notion responses
      // NOTE: Notion service publishes to SCRAPPING_NOTION_RESPONSE when a page is created
      await this.rabbitmq.subscribe(
        QUEUES.SCRAPPING_NOTION_RESPONSE,
        ROUTING_KEYS.SCRAPPING_NOTION_RESPONSE,
        (payload: Record<string, any>) => this.handleNotionResponse(payload),
      )
      this.logger.log(`✅ Subscribed to ${QUEUES.SCRAPPING_NOTION_RESPONSE} queue`)

      this.logger.log('✅ ScrapingResponseListener initialized successfully - Waiting for Notion responses...')
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      this.logger.error(`❌ Failed to initialize ScrapingResponseListener: ${msg}`)
      throw error
    }
  }

  /**
   * Handle responses from Notion service
   * 
   * When Notion successfully creates a page, send WhatsApp notification
   * with the link to the Notion page.
   * 
   * @param payload - Notion response payload
   */
  private async handleNotionResponse(payload: Record<string, any>): Promise<void> {
    try {
      this.logger.log(
        `📨 Received Notion response | messageId=${payload.messageId}, status=${payload.status}`,
      )

      if (payload.status === 'SUCCESS') {
        const { notionPageUrl, messageId, userId } = payload

        // ========== STEP 1: Format WhatsApp notification ==========
        const notionMessage = `
✅ *Tu scraping está en Notion*

📄 La página fue creada exitosamente
🔗 Ver en Notion: ${notionPageUrl}

⏰ ${new Date().toLocaleString('es-CO')}
        `.trim()

        // ========== STEP 2: Send to user via MessagesService ==========
        // Use userId from payload if available, otherwise use personal number
        const targetNumber = userId || this.personalWhatsappNumber

        this.logger.log(`📱 STEP 1: Sending Notion success notification`)
        this.logger.log(`   - targetNumber: ${targetNumber}`)
        this.logger.log(`   - messageId: ${messageId}`)
        this.logger.log(`   - notionPageUrl: ${notionPageUrl}`)

        try {
          // Send via MessagesService (which handles all channel routing)
          const sendResult = await this.messagesService.send({
            channel: 'whatsapp',
            recipients: [targetNumber],
            message: notionMessage,
            metadata: {
              messageId,
              type: 'notion_page_created',
            },
          })

          this.logger.log(`✅ WhatsApp notification sent successfully | messageId=${messageId}`)
          this.logger.log(`   - result.id: ${sendResult.id}`)
          this.logger.log(`   - result.status: ${sendResult.status}`)
        } catch (wpError) {
          const err = wpError instanceof Error ? wpError.message : String(wpError)
          this.logger.error(`❌ Failed to send WhatsApp notification: ${err}`)
          this.logger.error(`   - targetNumber: ${targetNumber}`)
          this.logger.error(`   - messageId: ${messageId}`)
          throw wpError
        }
      } else {
        this.logger.warn(
          `⚠️ Notion operation failed | messageId=${payload.messageId}, error=${payload.error}`,
        )
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      this.logger.error(`❌ Error processing Notion response: ${msg}`)
      throw error // Re-throw so RabbitMQ can nack and handle
    }
  }
}
