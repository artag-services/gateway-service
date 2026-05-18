import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { AgentService } from './agent.service'
import { ChatDto } from './dto/chat.dto'

/**
 * Agent endpoints.
 *
 * Listing conversations is gone from here — use the unified read model
 * instead: `GET /v1/query/conversations?channel=agent` or
 * `GET /v1/query/users/:userId/conversations?channel=agent`.
 *
 * `GET conversations/:id` is kept because the agent-detail view returns
 * messages WITH tool_use / tool_result blocks, which the cross-channel
 * UnifiedMessage projection deliberately strips out.
 *
 * Memory listings stay here because memories are agent-internal state
 * (preferences, facts) that don't belong in the cross-channel read model.
 */
@Controller('v1/agent')
export class AgentController {
  constructor(private readonly agent: AgentService) {}

  /**
   * Send a message to the agent. Returns the final assistant text + a
   * summary of tools used. For incremental streaming, set
   * enableStreaming=true and subscribe to SSE topic agent:<conversationId>.
   */
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  chat(@Body() dto: ChatDto) {
    return this.agent.chat(dto)
  }

  /**
   * Full conversation detail INCLUDING tool_use / tool_result blocks —
   * used by the agent-detail UI. For the cross-channel summary view,
   * use `GET /v1/query/conversations/:id` instead.
   */
  @Get('conversations/:id')
  getConversation(@Param('id') id: string) {
    return this.agent.getConversation(id)
  }

  @Delete('conversations/:id')
  @HttpCode(HttpStatus.OK)
  deleteConversation(@Param('id') id: string) {
    return this.agent.deleteConversation(id)
  }

  @Get('memories')
  listMemories(@Query('userId') userId: string, @Query('type') type?: string) {
    if (!userId) throw new BadRequestException('userId query param is required')
    return this.agent.listMemories(userId, type)
  }

  @Delete('memories/:userId/:key')
  @HttpCode(HttpStatus.OK)
  deleteMemory(@Param('userId') userId: string, @Param('key') key: string) {
    return this.agent.deleteMemory(userId, key)
  }
}
