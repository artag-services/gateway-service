import { Controller, Post, Body, HttpCode, HttpStatus, Logger, BadRequestException } from '@nestjs/common'
import { ScrapingService } from './scraping.service'
import { CreateScrapingTaskDto, ScrapingTaskResponseDto, NotifyNotionDto } from './dto'

@Controller('v1/scraping')
export class ScrapingController {
  private readonly logger = new Logger(ScrapingController.name);

  constructor(private readonly scrapingService: ScrapingService) {}

   /**
    * Crear una nueva tarea de scraping
    * @param dto - URL y parámetros opcionales de scraping
    * @returns requestId para rastrear la tarea
    */
   @Post('tasks')
   @HttpCode(HttpStatus.ACCEPTED)
   async createTask(@Body() dto: CreateScrapingTaskDto): Promise<ScrapingTaskResponseDto> {
     this.logger.log(`Received scraping request for URL: ${dto.url}`);

     if (!dto.url) {
       throw new BadRequestException('URL is required');
     }

     try {
       const result = await this.scrapingService.createScrapingTask(dto);
       return result;
     } catch (error) {
       this.logger.error(`Failed to create scraping task: ${error}`);
       throw error;
     }
   }

   /**
    * Notify Gateway about scraped data from Scraping Service
    * 
    * This endpoint receives cleaned data from the Scraping Service
    * and publishes it to Notion via RabbitMQ.
    * 
    * Flow:
    * 1. Scraping Service sends cleaned data
    * 2. Gateway publishes to Notion service
    * 3. Gateway returns 202 ACCEPTED immediately (async)
    * 4. When Notion responds, Gateway sends WhatsApp notification
    * 
    * @param dto - NotifyNotionDto with userId, title, url, and cleaned data
    * @returns { requestId, message, timestamp }
    */
   @Post('notify-notion')
   @HttpCode(HttpStatus.ACCEPTED)
   async notifyNotion(@Body() dto: NotifyNotionDto): Promise<{ requestId: string; message: string; timestamp: string }> {
     this.logger.log(`📨 Received notify-notion request from Scraping Service`)
     this.logger.log(`   - userId: ${dto.userId}`)
     this.logger.log(`   - title: ${dto.title}`)
     this.logger.log(`   - url: ${dto.url}`)

     if (!dto.userId || !dto.title || !dto.data) {
       throw new BadRequestException('userId, title, and data are required')
     }

     try {
       const result = await this.scrapingService.notifyNotion(dto)
       return result
     } catch (error) {
       this.logger.error(`Failed to notify Notion: ${error}`)
       throw error
     }
   }
}
