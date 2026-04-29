import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service'
import { RequestResponseManager } from '../../identity/services/request-response.manager'
import { ROUTING_KEYS } from '../../rabbitmq/constants/queues'
import { ChatDto } from './dto/chat.dto'

/**
 * Gateway-side façade for the agent microservice. All comms via RabbitMQ.
 */
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name)

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly rrm: RequestResponseManager,
  ) {}

  async chat(dto: ChatDto): Promise<unknown> {
    if (!dto.message) throw new BadRequestException('message is required')
    const { correlationId, promise } = this.rrm.createRequest()
    await this.rabbitmq.publish(ROUTING_KEYS.AGENT_CHAT, { correlationId, ...dto })
    return promise
  }

  async listConversations(userId?: string, limit?: number): Promise<unknown[]> {
    const { correlationId, promise } = this.rrm.createRequest()
    await this.rabbitmq.publish(ROUTING_KEYS.AGENT_LIST_CONVERSATIONS, {
      correlationId,
      userId,
      limit,
    })
    const res = await promise
    return (res.conversations ?? []) as unknown[]
  }

  async getConversation(id: string): Promise<unknown> {
    if (!id) throw new BadRequestException('id is required')
    const { correlationId, promise } = this.rrm.createRequest()
    await this.rabbitmq.publish(ROUTING_KEYS.AGENT_GET_CONVERSATION, { correlationId, id })
    const res = await promise
    return res.conversation ?? null
  }

  async deleteConversation(id: string): Promise<unknown> {
    if (!id) throw new BadRequestException('id is required')
    const { correlationId, promise } = this.rrm.createRequest()
    await this.rabbitmq.publish(ROUTING_KEYS.AGENT_DELETE_CONVERSATION, { correlationId, id })
    return promise
  }

  async listMemories(userId: string, type?: string): Promise<unknown[]> {
    if (!userId) throw new BadRequestException('userId is required')
    const { correlationId, promise } = this.rrm.createRequest()
    await this.rabbitmq.publish(ROUTING_KEYS.AGENT_LIST_MEMORIES, {
      correlationId,
      userId,
      type,
    })
    const res = await promise
    return (res.memories ?? []) as unknown[]
  }

  async deleteMemory(userId: string, key: string): Promise<unknown> {
    if (!userId || !key) throw new BadRequestException('userId and key are required')
    const { correlationId, promise } = this.rrm.createRequest()
    await this.rabbitmq.publish(ROUTING_KEYS.AGENT_DELETE_MEMORY, {
      correlationId,
      userId,
      key,
    })
    return promise
  }
}
