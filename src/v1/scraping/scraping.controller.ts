import { Controller, Post, Body, HttpCode, HttpStatus, Logger, BadRequestException } from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import { CreateScrapingTaskDto, ScrapingTaskResponseDto } from './dto';

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
}
