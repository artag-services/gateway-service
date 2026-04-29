import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service'
import { RequestResponseManager } from '../../identity/services/request-response.manager'
import { ROUTING_KEYS, QUEUES } from '../../rabbitmq/constants/queues'

@Injectable()
export class AgentResponseListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AgentResponseListener.name)

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly rrm: RequestResponseManager,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitmq.subscribe(
      QUEUES.AGENT_RESPONSES,
      ROUTING_KEYS.AGENT_RESPONSE,
      (msg) => this.handle(msg),
    )
    this.logger.log('Agent response listener started')
  }

  private async handle(message: Record<string, unknown>): Promise<void> {
    const { correlationId, success, error, ...rest } = message as {
      correlationId?: string
      success?: boolean
      error?: string
    } & Record<string, unknown>

    if (!correlationId) {
      this.logger.warn('Received agent response without correlationId')
      return
    }

    if (success) {
      this.rrm.resolveResponse(correlationId, rest)
    } else {
      this.rrm.rejectResponse(correlationId, error ?? 'Unknown agent error')
    }
  }

  onModuleDestroy(): void {
    this.rrm.cleanup()
  }
}
