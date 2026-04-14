import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service'
import { ROUTING_KEYS } from '../../rabbitmq/constants/queues'
import { CreateScrapingTaskDto, NotifyNotionDto } from './dto'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly configService: ConfigService,
  ) {}

   /**
    * Crea una tarea de scraping y la publica a RabbitMQ
    * @param dto - Datos de la solicitud de scraping
    * @returns Objeto con requestId
    */
   async createScrapingTask(dto: CreateScrapingTaskDto): Promise<{ requestId: string; message: string; timestamp: string }> {
     const requestId = uuidv4()
     const userId = dto.userId || 'anonymous'

     this.logger.log(`Creating scraping task: ${requestId} for URL: ${dto.url}`)

     try {
       // Determine scraping type: if no instructions provided, use 'auto'
       const hasInstructions = dto.instructions && Object.keys(dto.instructions).length > 0
       const scrapingType = dto.type || (hasInstructions ? 'simple' : 'auto')

       // Construir el mensaje para RabbitMQ (compatible con el servicio de scraping)
       const scrapingMessage = {
         requestId,
         userId,
         url: dto.url,
         instructions: {
           type: scrapingType,
           action: `Scrape content from ${dto.url}`,
           ...(hasInstructions ? dto.instructions : {}),
           timeout: 30000,
         },
         timestamp: new Date().toISOString(),
       }

       // Publicar a RabbitMQ
       this.rabbitmq.publish(ROUTING_KEYS.SCRAPING_TASK, scrapingMessage as unknown as Record<string, unknown>)

       this.logger.log(`Scraping task published to RabbitMQ: ${requestId} (type: ${scrapingType})`)

       return {
         requestId,
         message: `Scraping task created and queued for processing: ${dto.url}`,
         timestamp: new Date().toISOString(),
       }
     } catch (error) {
       this.logger.error(`Failed to create scraping task: ${error}`)
       throw error
     }
   }

   /**
    * Handle notification from Scraping Service about completed scraping
    * 
    * This method receives cleaned data from the Scraping Service and publishes it to Notion.
    * The actual WhatsApp notification is sent later by ScrapingResponseListener
    * after Notion responds.
    * 
    * Flow:
    * 1. Scraping Service POSTs cleaned data to /api/scraping/notify-notion
    * 2. This method publishes to RabbitMQ channels.notion.send
    * 3. Notion service receives and creates a page
    * 4. Notion publishes response to channels.scrapping.notion-response
    * 5. ScrapingResponseListener sends WhatsApp notification
    * 
    * @param dto - NotifyNotionDto with userId, title, url, and cleaned data
    * @returns requestId and confirmation
    */
   async notifyNotion(dto: NotifyNotionDto): Promise<{ requestId: string; message: string; timestamp: string }> {
     const messageId = uuidv4()

     this.logger.log(`📤 notifyNotion() - Publishing to Notion service`)
     this.logger.log(`   - messageId: ${messageId}`)
     this.logger.log(`   - userId: ${dto.userId}`)
     this.logger.log(`   - title: ${dto.title}`)

     try {
       // Resolve parent_page_id with fallback to environment variable
       const defaultParentPageId = this.configService.get('NOTION_PARENT_PAGE_ID')
       const parentPageId = dto.notionPageId || defaultParentPageId

       this.logger.log(`   - Using parent_page_id: ${parentPageId}`)
       if (!dto.notionPageId && defaultParentPageId) {
         this.logger.log(`   - (from ENV fallback NOTION_PARENT_PAGE_ID)`)
       }

       // Build the message for Notion service (same format as before)
       const notionMessage = {
         messageId,
         operation: 'create_page',
         message: JSON.stringify(dto.data),
         metadata: {
           parent_page_id: parentPageId,
           title: dto.title,
           icon: '🔗',
           userId: dto.userId,
           url: dto.url,
         },
         timestamp: new Date().toISOString(),
       }

       // Publish to RabbitMQ - Notion service will receive this
       this.logger.log(`🚀 Publishing to RabbitMQ routing key: ${ROUTING_KEYS.NOTION_SEND}`)
       this.rabbitmq.publish(
         ROUTING_KEYS.NOTION_SEND,
         notionMessage as unknown as Record<string, unknown>,
       )

       this.logger.log(`✅ Message published to Notion service | messageId=${messageId}`)

       return {
         requestId: messageId,
         message: `Notion notification queued for processing: ${dto.title}`,
         timestamp: new Date().toISOString(),
       }
     } catch (error) {
       const err = error instanceof Error ? error.message : String(error)
       this.logger.error(`❌ Failed to notify Notion: ${err}`)
       throw error
     }
   }
}
