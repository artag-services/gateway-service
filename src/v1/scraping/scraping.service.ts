import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v4 as uuidv4 } from 'uuid'

import { RabbitMQService } from '../../rabbitmq/rabbitmq.service'
import { RequestResponseManager } from '../../identity/services/request-response.manager'
import { ROUTING_KEYS } from '../../rabbitmq/constants/queues'
import { CreateScrapingTaskDto, NotifyNotionDto } from './dto'

/**
 * Gateway-side façade for the scraping microservice.
 * - createTask: fire-and-forget; returns the jobId so clients can subscribe via SSE
 * - list/get/remove: RPC over RabbitMQ
 * - notifyNotion: legacy bridge kept for backwards-compat with the old scraping flow
 */
@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name)

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly rrm: RequestResponseManager,
    private readonly config: ConfigService,
  ) {}

  // ─────────── Fire-and-forget create ───────────
  createTask(dto: CreateScrapingTaskDto): { jobId: string; accepted: true; subscribeTo: string } {
    if (!dto.url) throw new BadRequestException('url is required')
    if (!dto.strategy) throw new BadRequestException('strategy is required')

    const jobId = uuidv4()
    this.rabbitmq.publish(ROUTING_KEYS.SCRAPING_TASK, {
      jobId,
      ...dto,
    } as unknown as Record<string, unknown>)

    this.logger.log(`Scraping task ${jobId} queued for ${dto.url} [${dto.strategy}]`)
    return {
      jobId,
      accepted: true,
      subscribeTo: `scraping:${jobId}`, // hint for SSE client
    }
  }

  // ─────────── Reads (RPC) ───────────
  async list(limit?: number, userId?: string): Promise<unknown[]> {
    const { correlationId, promise } = this.rrm.createRequest()
    await this.rabbitmq.publish(ROUTING_KEYS.SCRAPING_LIST, { correlationId, limit, userId })
    const res = await promise
    return (res.jobs ?? []) as unknown[]
  }

  async get(id: string): Promise<unknown> {
    if (!id) throw new BadRequestException('id is required')
    const { correlationId, promise } = this.rrm.createRequest()
    await this.rabbitmq.publish(ROUTING_KEYS.SCRAPING_GET, { correlationId, id })
    const res = await promise
    return res.job ?? null
  }

  async remove(id: string): Promise<unknown> {
    if (!id) throw new BadRequestException('id is required')
    const { correlationId, promise } = this.rrm.createRequest()
    await this.rabbitmq.publish(ROUTING_KEYS.SCRAPING_DELETE, { correlationId, id })
    return promise
  }

  async cleanupExpired(): Promise<unknown> {
    const { correlationId, promise } = this.rrm.createRequest()
    await this.rabbitmq.publish(ROUTING_KEYS.SCRAPING_CLEANUP_EXPIRED, { correlationId })
    return promise
  }

  // ─────────── Legacy notify-notion bridge (kept for old flow) ───────────
  notifyNotion(dto: NotifyNotionDto): { requestId: string; message: string; timestamp: string } {
    const messageId = uuidv4()
    const defaultParentPageId = this.config.get<string>('NOTION_PARENT_PAGE_ID')
    const parentPageId = dto.notionPageId || defaultParentPageId

    this.rabbitmq.publish(ROUTING_KEYS.NOTION_SEND, {
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
    })

    return {
      requestId: messageId,
      message: `Notion notification queued for: ${dto.title}`,
      timestamp: new Date().toISOString(),
    }
  }
}
