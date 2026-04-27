import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { RabbitMQService } from '../../../rabbitmq/rabbitmq.service'
import { RequestResponseManager } from '../../../identity/services/request-response.manager'
import { ROUTING_KEYS, QUEUES } from '../../../rabbitmq/constants/queues'

/**
 * Subscribes to the scraping service's RPC response queue. Resolves
 * pending promises by correlationId so HTTP callers can `await` the result.
 */
@Injectable()
export class ScrapingResponseListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ScrapingResponseListener.name)

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly rrm: RequestResponseManager,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitmq.subscribe(
      QUEUES.SCRAPING_RESPONSES,
      ROUTING_KEYS.SCRAPING_RESPONSE,
      (msg) => this.handle(msg),
    )
    this.logger.log('Scraping response listener started')
  }

  private async handle(message: Record<string, unknown>): Promise<void> {
    const { correlationId, success, error, ...rest } = message as {
      correlationId?: string
      success?: boolean
      error?: string
    } & Record<string, unknown>

    if (!correlationId) {
      this.logger.warn('Received scraping response without correlationId')
      return
    }

    if (success) {
      this.rrm.resolveResponse(correlationId, rest)
    } else {
      this.rrm.rejectResponse(correlationId, error ?? 'Unknown scraping error')
    }
  }

  onModuleDestroy(): void {
    this.rrm.cleanup()
  }
}
