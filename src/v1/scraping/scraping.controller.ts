import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
} from '@nestjs/common'
import { ScrapingService } from './scraping.service'
import { CreateScrapingTaskDto, NotifyNotionDto } from './dto'

/**
 * Scraping API — writes only. Reads moved to the unified read model:
 *
 *   GET /v1/query/scraping-tasks            — list (filter ?status)
 *   GET /v1/query/scraping-tasks/:id        — single task summary
 *   GET /v1/query/users/:userId/scraping-tasks
 *
 * For real-time progress, subscribe to SSE on `scraping:<jobId>`.
 */
@Controller('v1/scraping')
export class ScrapingController {
  private readonly logger = new Logger(ScrapingController.name)

  constructor(private readonly scrapingService: ScrapingService) {}

  /**
   * Create a scraping task. Fire-and-forget — returns 202 with `jobId`.
   * Subscribe to SSE topic `scraping:<jobId>` (GET /api/v1/events?topics=...)
   * to receive completed/failed events.
   */
  @Post('tasks')
  @HttpCode(HttpStatus.ACCEPTED)
  createTask(@Body() dto: CreateScrapingTaskDto) {
    this.logger.log(`Scraping task requested: ${dto.url} [${dto.strategy}]`)
    return this.scrapingService.createTask(dto)
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  remove(@Param('id') id: string) {
    return this.scrapingService.remove(id)
  }

  /**
   * Trigger cleanup of expired jobs in the scraping DB. Intended to be
   * invoked periodically by the scheduler (cron task pointing at this URL,
   * or directly via channels.scraping.cleanup-expired).
   */
  @Post('cleanup-expired')
  @HttpCode(HttpStatus.OK)
  cleanupExpired() {
    return this.scrapingService.cleanupExpired()
  }

  // Legacy — used by the old scraping flow; kept for back-compat.
  @Post('notify-notion')
  @HttpCode(HttpStatus.ACCEPTED)
  notifyNotion(@Body() dto: NotifyNotionDto) {
    if (!dto.userId || !dto.title || !dto.data) {
      throw new BadRequestException('userId, title, and data are required')
    }
    return this.scrapingService.notifyNotion(dto)
  }
}
