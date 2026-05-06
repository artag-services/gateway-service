import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';

/**
 * HTTP entry point for transactional emails. Forwards to the email
 * microservice via RabbitMQ — no direct HTTP between gateway and email
 * service.
 */
@Controller('v1/emails')
export class EmailController {
  constructor(private readonly emails: EmailService) {}

  // ── Outbound emails ──
  @Get()
  list(@Query('limit') limit?: string) {
    return this.emails.list(limit ? parseInt(limit, 10) : undefined);
  }

  @Post()
  send(@Body() dto: SendEmailDto) {
    return this.emails.send(dto);
  }

  // ── Multi-domain config (frontend dropdown) ──
  @Get('domains')
  listDomains() {
    return this.emails.listDomains();
  }

  // ── Inbound emails ──
  @Get('inbound')
  listInbound(@Query('domain') domain?: string, @Query('limit') limit?: string) {
    return this.emails.listInbound(domain, limit ? parseInt(limit, 10) : undefined);
  }

  @Get('inbound/:id')
  getInbound(@Param('id') id: string) {
    return this.emails.getInbound(id);
  }

  @Post('inbound/cleanup-expired')
  cleanupInbound() {
    return this.emails.cleanupInbound();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.emails.get(id);
  }
}
