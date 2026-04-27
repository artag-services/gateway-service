import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { ScrapingService } from './scraping.service'
import { CreateScrapingTaskDto, NotifyNotionDto } from './dto'

@Controller('v1/scraping')
export class ScrapingController {
  private readonly logger = new Logger(ScrapingController.name)

  constructor(private readonly scrapingService: ScrapingService) {}

  // ─────────────── Tasks ───────────────

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

  @Get('tasks')
  list(@Query('limit') limit?: string, @Query('userId') userId?: string) {
    return this.scrapingService.list(limit ? parseInt(limit, 10) : undefined, userId)
  }

  @Get('tasks/:id')
  get(@Param('id') id: string) {
    return this.scrapingService.get(id)
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

  // ─────────────── Legacy ───────────────
  /** Kept for backwards-compat. Internal — used by the old scraping flow. */
  @Post('notify-notion')
  @HttpCode(HttpStatus.ACCEPTED)
  notifyNotion(@Body() dto: NotifyNotionDto) {
    if (!dto.userId || !dto.title || !dto.data) {
      throw new BadRequestException('userId, title, and data are required')
    }
    return this.scrapingService.notifyNotion(dto)
  }
}
