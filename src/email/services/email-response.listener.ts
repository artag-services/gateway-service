import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { RequestResponseManager } from '../../identity/services/request-response.manager';
import { ROUTING_KEYS, QUEUES } from '../../rabbitmq/constants/queues';

/**
 * Subscribes to the email service's RPC response routing key. Resolves
 * promises by correlationId so HTTP callers can await the result.
 */
@Injectable()
export class EmailResponseListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailResponseListener.name);

  constructor(
    private rabbitmq: RabbitMQService,
    private rrm: RequestResponseManager,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitmq.subscribe(
      QUEUES.EMAIL_RESPONSES,
      ROUTING_KEYS.EMAIL_RESPONSE,
      (msg: Record<string, unknown>) => this.handle(msg),
    );
    this.logger.log('Email response listener started');
  }

  private async handle(message: Record<string, unknown>): Promise<void> {
    const { correlationId, success, error, ...rest } = message as {
      correlationId?: string;
      success?: boolean;
      error?: string;
    } & Record<string, unknown>;

    if (!correlationId) {
      this.logger.warn('Received email response without correlationId');
      return;
    }

    if (success) {
      this.rrm.resolveResponse(correlationId, rest);
    } else {
      this.rrm.rejectResponse(correlationId, error ?? 'Unknown email error');
    }
  }

  onModuleDestroy(): void {
    this.rrm.cleanup();
  }
}
