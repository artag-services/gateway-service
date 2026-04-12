import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { ROUTING_KEYS } from '../../rabbitmq/constants/queues';
import { CreateScrapingTaskDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(private readonly rabbitmq: RabbitMQService) {}

  /**
   * Crea una tarea de scraping y la publica a RabbitMQ
   * @param dto - Datos de la solicitud de scraping
   * @returns Objeto con requestId
   */
  async createScrapingTask(dto: CreateScrapingTaskDto): Promise<{ requestId: string; message: string; timestamp: string }> {
    const requestId = uuidv4();
    const userId = dto.userId || 'anonymous';

    this.logger.log(`Creating scraping task: ${requestId} for URL: ${dto.url}`);

    try {
      // Determine scraping type: if no instructions provided, use 'auto'
      const hasInstructions = dto.instructions && Object.keys(dto.instructions).length > 0;
      const scrapingType = dto.type || (hasInstructions ? 'simple' : 'auto');

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
      };

      // Publicar a RabbitMQ
      this.rabbitmq.publish(ROUTING_KEYS.SCRAPING_TASK, scrapingMessage as unknown as Record<string, unknown>);

      this.logger.log(`Scraping task published to RabbitMQ: ${requestId} (type: ${scrapingType})`);

      return {
        requestId,
        message: `Scraping task created and queued for processing: ${dto.url}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to create scraping task: ${error}`);
      throw error;
    }
  }
}
