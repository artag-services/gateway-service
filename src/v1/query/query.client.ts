import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/**
 * Thin HTTP client around the Sync Service's `/internal/query/*` API.
 *
 * Per architecture, this is the ONLY service the gateway calls over HTTP
 * (the rest goes through RabbitMQ). All read endpoints from the frontend
 * eventually land here.
 *
 * Uses native `fetch` (Node 18+) with an `AbortController` per request for
 * timeouts. `X-Internal-Auth` header is a shared secret with the sync
 * service. 5xx / network errors → `503 Service Unavailable` to the caller.
 */
@Injectable()
export class QueryClient implements OnModuleInit {
  private readonly logger = new Logger(QueryClient.name)
  private baseURL!: string
  private token!: string
  private timeoutMs!: number

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    this.baseURL = (this.config.get<string>('SYNC_SERVICE_URL') ?? 'http://sync:3012').replace(/\/$/, '')
    this.token = this.config.get<string>('SYNC_INTERNAL_AUTH_TOKEN') ?? ''
    this.timeoutMs = Number(this.config.get<string>('SYNC_API_TIMEOUT_MS') ?? 10_000)

    if (!this.token) {
      this.logger.warn(
        'SYNC_INTERNAL_AUTH_TOKEN not set — internal auth header will be empty. ' +
          'Sync service will reject requests if it enforces the guard.',
      )
    }

    this.logger.log(`QueryClient ready — sync=${this.baseURL} timeout=${this.timeoutMs}ms`)
  }

  async get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const url = this.buildUrl(path, params)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Auth': this.token,
        },
        signal: controller.signal,
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw this.wrapHttpError(res.status, text, path)
      }
      return (await res.json()) as T
    } catch (err) {
      if (err instanceof ServiceUnavailableException) throw err
      if ((err as { status?: number }).status === 404) throw err
      this.logger.error(`Sync request errored: ${path}`, err as Error)
      throw new ServiceUnavailableException('Read model unavailable')
    } finally {
      clearTimeout(timer)
    }
  }

  private buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
    const url = new URL(this.baseURL + path)
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
      }
    }
    return url.toString()
  }

  private wrapHttpError(status: number, body: string, path: string): Error {
    if (status === 404) {
      const message = this.extractMessage(body) ?? `Not found: ${path}`
      return Object.assign(new Error(message), { status: 404 })
    }
    if (status === 401 || status === 403) {
      this.logger.error(
        `Sync rejected auth on ${path} (status=${status}). Check SYNC_INTERNAL_AUTH_TOKEN matches both services.`,
      )
      return new ServiceUnavailableException('Read model unavailable')
    }
    this.logger.error(
      `Sync request failed: ${path} → status=${status} body=${body.slice(0, 300)}`,
    )
    return new ServiceUnavailableException('Read model unavailable')
  }

  private extractMessage(body: string): string | null {
    try {
      const parsed = JSON.parse(body) as { message?: string }
      return parsed.message ?? null
    } catch {
      return null
    }
  }
}
