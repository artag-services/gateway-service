import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { RequestResponseManager } from '../../identity/services/request-response.manager';
import { ROUTING_KEYS } from '../../rabbitmq/constants/queues';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

/**
 * Gateway-side façade for the scheduler microservice. ALL communication is
 * via RabbitMQ — there is intentionally no HTTP client here. Reads use the
 * RPC pattern (correlationId + response queue); fire-and-forget endpoints
 * (trigger, delete) skip the await.
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly rrm: RequestResponseManager,
  ) {}

  // ─────────────────────────────────────────────
  // Reads (RPC)
  // ─────────────────────────────────────────────
  async list(): Promise<unknown[]> {
    const { correlationId, promise } = this.rrm.createRequest();
    await this.rabbitmq.publish(ROUTING_KEYS.SCHEDULER_LIST, { correlationId });
    const res = await promise;
    return (res.tasks ?? []) as unknown[];
  }

  async get(id: string): Promise<unknown> {
    if (!id) throw new BadRequestException('id is required');
    const { correlationId, promise } = this.rrm.createRequest();
    await this.rabbitmq.publish(ROUTING_KEYS.SCHEDULER_GET, { correlationId, id });
    const res = await promise;
    return res.task ?? null;
  }

  async runs(id: string, limit?: number): Promise<unknown[]> {
    if (!id) throw new BadRequestException('id is required');
    const { correlationId, promise } = this.rrm.createRequest();
    await this.rabbitmq.publish(ROUTING_KEYS.SCHEDULER_RUNS, { correlationId, id, limit });
    const res = await promise;
    return (res.runs ?? []) as unknown[];
  }

  // ─────────────────────────────────────────────
  // Writes (RPC — return the resulting task)
  // ─────────────────────────────────────────────
  async create(dto: CreateTaskDto): Promise<unknown> {
    const { correlationId, promise } = this.rrm.createRequest();
    await this.rabbitmq.publish(ROUTING_KEYS.SCHEDULER_CREATE, { correlationId, ...dto });
    return promise;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<unknown> {
    if (!id) throw new BadRequestException('id is required');
    const { correlationId, promise } = this.rrm.createRequest();
    await this.rabbitmq.publish(ROUTING_KEYS.SCHEDULER_UPDATE, { correlationId, id, ...dto });
    return promise;
  }

  async pause(id: string): Promise<unknown> {
    if (!id) throw new BadRequestException('id is required');
    const { correlationId, promise } = this.rrm.createRequest();
    await this.rabbitmq.publish(ROUTING_KEYS.SCHEDULER_PAUSE, { correlationId, id });
    return promise;
  }

  async resume(id: string): Promise<unknown> {
    if (!id) throw new BadRequestException('id is required');
    const { correlationId, promise } = this.rrm.createRequest();
    await this.rabbitmq.publish(ROUTING_KEYS.SCHEDULER_RESUME, { correlationId, id });
    return promise;
  }

  // ─────────────────────────────────────────────
  // Fire-and-forget
  // ─────────────────────────────────────────────
  async triggerNow(id: string): Promise<{ accepted: true }> {
    if (!id) throw new BadRequestException('id is required');
    await this.rabbitmq.publish(ROUTING_KEYS.SCHEDULER_TRIGGER, { id });
    this.logger.log(`Trigger queued for task ${id}`);
    return { accepted: true };
  }

  async remove(id: string): Promise<{ accepted: true }> {
    if (!id) throw new BadRequestException('id is required');
    await this.rabbitmq.publish(ROUTING_KEYS.SCHEDULER_DELETE, { id });
    this.logger.log(`Delete queued for task ${id}`);
    return { accepted: true };
  }
}
