import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { RequestResponseManager } from '../../identity/services/request-response.manager';
import { ROUTING_KEYS, QUEUES } from '../../rabbitmq/constants/queues';

/**
 * Subscribes to the scheduler's RPC response routing key. Each response
 * carries a `correlationId`; we look it up in RequestResponseManager and
 * resolve the awaiting promise.
 *
 * This is what makes "no direct HTTP between gateway and scheduler" work:
 * the gateway publishes a request and awaits on a queue, the scheduler
 * publishes a response on this queue, and the listener wakes up the caller.
 */
@Injectable()
export class SchedulerResponseListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SchedulerResponseListener.name);

  constructor(
    private rabbitmq: RabbitMQService,
    private rrm: RequestResponseManager,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitmq.subscribe(
      QUEUES.SCHEDULER_RESPONSES,
      ROUTING_KEYS.SCHEDULER_RESPONSE,
      (msg: Record<string, unknown>) => this.handle(msg),
    );
    this.logger.log('Scheduler response listener started');
  }

  private async handle(message: Record<string, unknown>): Promise<void> {
    const { correlationId, success, error, ...rest } = message as {
      correlationId?: string;
      success?: boolean;
      error?: string;
    } & Record<string, unknown>;

    if (!correlationId) {
      this.logger.warn('Received scheduler response without correlationId');
      return;
    }

    if (success) {
      this.rrm.resolveResponse(correlationId, rest);
    } else {
      this.rrm.rejectResponse(correlationId, error ?? 'Unknown scheduler error');
    }
  }

  onModuleDestroy(): void {
    this.rrm.cleanup();
  }
}
