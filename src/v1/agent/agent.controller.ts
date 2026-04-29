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

  @Get('conversations')
  listConversations(@Query('userId') userId?: string, @Query('limit') limit?: string) {
    return this.agent.listConversations(userId, limit ? parseInt(limit, 10) : undefined)
  }

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
