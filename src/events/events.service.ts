import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Response } from 'express'
import { RabbitMQService } from '../rabbitmq/rabbitmq.service'
import { ROUTING_KEYS } from '../rabbitmq/constants/queues'

interface SseClient {
  id: string
  topics: Set<string>
  res: Response
}

/**
 * Server-Sent Events bus. Subscribes ONCE to lifecycle event routing keys
 * from RabbitMQ; clients subscribe by topic via the HTTP endpoint
 * `GET /api/v1/events?topics=scraping:<jobId>,email:<emailId>,...`.
 *
 * When a service publishes e.g. `channels.scraping.events.completed` with
 * payload `{ jobId: "abc", ... }`, we compute the topic key `scraping:abc`
 * and write to every connected client subscribed to that topic.
 *
 * The `*` wildcard subscribes to all events of a service:
 *   topics=scraping:*  → all scraping events
 *   topics=*           → everything (use with care, browser-side)
 */
@Injectable()
export class EventsService implements OnModuleInit {
  private readonly logger = new Logger(EventsService.name)
  private clients = new Map<string, SseClient>()

  constructor(private readonly rabbitmq: RabbitMQService) {}

  async onModuleInit(): Promise<void> {
    // Subscribe to scraping lifecycle events
    await this.rabbitmq.subscribe(
      'gateway.sse.scraping',
      'channels.scraping.events.#',
      async (msg) => this.routeScrapingEvent(msg),
    )

    // Subscribe to email lifecycle events
    await this.rabbitmq.subscribe(
      'gateway.sse.email',
      'channels.email.events.#',
      async (msg) => this.routeEmailEvent(msg),
    )

    // Subscribe to scheduler events
    await this.rabbitmq.subscribe(
      'gateway.sse.scheduler',
      ROUTING_KEYS.SCHEDULER_TASK_FIRED,
      async (msg) => this.routeSchedulerEvent(msg),
    )

    this.logger.log('SSE bus subscribed — scraping, email, scheduler events')
  }

  /**
   * Register a new client. The Express response is held open; the SSE
   * handshake (`Content-Type: text/event-stream`) must be set by the caller
   * before passing it in.
   */
  register(clientId: string, topics: string[], res: Response): void {
    const client: SseClient = {
      id: clientId,
      topics: new Set(topics),
      res,
    }
    this.clients.set(clientId, client)
    this.logger.log(
      `SSE client connected: ${clientId} subscribed to [${topics.join(', ')}] (total ${this.clients.size})`,
    )

    // Send initial hello so the client knows the stream is live
    this.write(res, 'connected', { clientId, topics })

    // Heartbeat every 25s to keep proxies/Cloudflare from closing the conn
    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat ${Date.now()}\n\n`)
      } catch {
        clearInterval(heartbeat)
        this.unregister(clientId)
      }
    }, 25_000)

    res.on('close', () => {
      clearInterval(heartbeat)
      this.unregister(clientId)
    })
  }

  unregister(clientId: string): void {
    if (this.clients.delete(clientId)) {
      this.logger.log(`SSE client disconnected: ${clientId} (total ${this.clients.size})`)
    }
  }

  /** Internal: route a parsed event to all matching clients. */
  private dispatch(eventName: string, topicKey: string, payload: Record<string, unknown>): void {
    const [service] = topicKey.split(':')
    const wildcardService = `${service}:*`

    for (const client of this.clients.values()) {
      if (
        client.topics.has(topicKey) ||
        client.topics.has(wildcardService) ||
        client.topics.has('*')
      ) {
        try {
          this.write(client.res, eventName, payload)
        } catch (err) {
          this.logger.warn(`Failed write to client ${client.id}: ${(err as Error).message}`)
          this.unregister(client.id)
        }
      }
    }
  }

  private write(res: Response, eventName: string, payload: unknown): void {
    res.write(`event: ${eventName}\n`)
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
  }

  // ─────────────── Routers per service ───────────────

  private routeScrapingEvent(payload: Record<string, unknown>): void {
    const jobId = payload.jobId as string | undefined
    if (!jobId) return
    const eventName = this.scrapingEventNameFromPayload(payload)
    this.dispatch(eventName, `scraping:${jobId}`, payload)
  }

  private routeEmailEvent(payload: Record<string, unknown>): void {
    const emailId = (payload.emailId ?? payload.providerMessageId) as string | undefined
    if (!emailId) return
    const eventName = (payload.type as string) ?? 'email:event'
    this.dispatch(eventName, `email:${emailId}`, payload)
  }

  private routeSchedulerEvent(payload: Record<string, unknown>): void {
    const taskId = payload.taskId as string | undefined
    if (!taskId) return
    this.dispatch('scheduler:task-fired', `scheduler:${taskId}`, payload)
  }

  private scrapingEventNameFromPayload(payload: Record<string, unknown>): string {
    if ('completedAt' in payload && payload.success) return 'scraping:completed'
    if ('completedAt' in payload && payload.success === false) return 'scraping:failed'
    if ('startedAt' in payload && !('completedAt' in payload)) return 'scraping:started'
    return 'scraping:queued'
  }
}
