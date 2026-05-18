import {
  Controller,
  Get,
  HttpException,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import { QueryClient } from './query.client'

/**
 * Public read-model endpoints. Internally, every method just proxies to the
 * Sync Service's `/internal/query/*` with the shared-secret header.
 *
 * The frontend should use ONLY these endpoints for cross-service reads —
 * never poke individual microservices.
 */
@Controller('v1/query')
export class QueryController {
  constructor(private readonly sync: QueryClient) {}

  // ── Users ────────────────────────────────────────────────────────────

  @Get('users')
  async listUsers(@Query('limit') limit?: string, @Query('cursor') cursor?: string) {
    return this.sync.get('/internal/query/users', { limit, cursor })
  }

  @Get('users/:userId')
  async getUser(@Param('userId') userId: string) {
    return this.passThroughNotFound(() =>
      this.sync.get(`/internal/query/users/${encodeURIComponent(userId)}`),
    )
  }

  @Get('users/:userId/conversations')
  async getUserConversations(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.sync.get(
      `/internal/query/users/${encodeURIComponent(userId)}/conversations`,
      { limit, cursor },
    )
  }

  @Get('users/:userId/scraping-tasks')
  async getUserScrapingTasks(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.sync.get(
      `/internal/query/users/${encodeURIComponent(userId)}/scraping-tasks`,
      { limit, cursor },
    )
  }

  // ── Conversations ────────────────────────────────────────────────────

  @Get('conversations')
  async listConversations(@Query('limit') limit?: string, @Query('cursor') cursor?: string) {
    return this.sync.get('/internal/query/conversations', { limit, cursor })
  }

  @Get('conversations/:id')
  async getConversation(@Param('id') id: string) {
    return this.passThroughNotFound(() =>
      this.sync.get(`/internal/query/conversations/${encodeURIComponent(id)}`),
    )
  }

  @Get('conversations/:id/messages')
  async getConversationMessages(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.sync.get(
      `/internal/query/conversations/${encodeURIComponent(id)}/messages`,
      { limit, cursor },
    )
  }

  // ── Search ───────────────────────────────────────────────────────────

  @Get('search')
  async search(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.sync.get('/internal/query/search', { q, limit })
  }

  // ─────────────────────────────────────────

  private async passThroughNotFound<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (err) {
      const status = (err as { status?: number; response?: { status?: number } })?.status
      if (status === 404) {
        throw new NotFoundException((err as Error).message)
      }
      if (err instanceof HttpException) throw err
      throw err
    }
  }
}
