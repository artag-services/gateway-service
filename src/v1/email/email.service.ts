import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { RequestResponseManager } from '../../identity/services/request-response.manager';
import { ROUTING_KEYS } from '../../rabbitmq/constants/queues';
import { SendEmailDto } from './dto/send-email.dto';

/**
 * Gateway-side façade for the email microservice. All communication is via
 * RabbitMQ — no HTTP client to the email service exists in this codebase.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly rrm: RequestResponseManager,
  ) {}

  async send(dto: SendEmailDto): Promise<unknown> {
    const { correlationId, promise } = this.rrm.createRequest();
    await this.rabbitmq.publish(ROUTING_KEYS.EMAIL_SEND, { correlationId, ...dto });
    const res = await promise;
    return res.email ?? res;
  }

  async list(limit?: number): Promise<unknown[]> {
    const { correlationId, promise } = this.rrm.createRequest();
    await this.rabbitmq.publish(ROUTING_KEYS.EMAIL_LIST, { correlationId, limit });
    const res = await promise;
    return (res.emails ?? []) as unknown[];
  }

  async get(id: string): Promise<unknown> {
    if (!id) throw new BadRequestException('id is required');
    const { correlationId, promise } = this.rrm.createRequest();
    await this.rabbitmq.publish(ROUTING_KEYS.EMAIL_GET, { correlationId, id });
    const res = await promise;
    return res.email ?? null;
  }

  // ─────────────── Domains (multi-domain support) ───────────────

  async listDomains(): Promise<unknown[]> {
    const { correlationId, promise } = this.rrm.createRequest();
    await this.rabbitmq.publish(ROUTING_KEYS.EMAIL_LIST_DOMAINS, { correlationId });
    const res = await promise;
    return (res.domains ?? []) as unknown[];
  }

  // ─────────────── Inbound (received emails) ───────────────

  async listInbound(domain?: string, limit?: number): Promise<unknown[]> {
    const { correlationId, promise } = this.rrm.createRequest();
    await this.rabbitmq.publish(ROUTING_KEYS.EMAIL_LIST_INBOUND, {
      correlationId,
      domain,
      limit,
    });
    const res = await promise;
    return (res.inbound ?? []) as unknown[];
  }

  async getInbound(id: string): Promise<unknown> {
    if (!id) throw new BadRequestException('id is required');
    const { correlationId, promise } = this.rrm.createRequest();
    await this.rabbitmq.publish(ROUTING_KEYS.EMAIL_GET_INBOUND, { correlationId, id });
    const res = await promise;
    return res.inbound ?? null;
  }

  async cleanupInbound(): Promise<unknown> {
    const { correlationId, promise } = this.rrm.createRequest();
    await this.rabbitmq.publish(ROUTING_KEYS.EMAIL_CLEANUP_INBOUND, { correlationId });
    return promise;
  }
}
