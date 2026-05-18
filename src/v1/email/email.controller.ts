import { Body, Controller, Get, Post } from '@nestjs/common';

import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';

/**
 * HTTP entry point for transactional emails. Writes only — sending,
 * inbound cleanup, and reading the multi-domain config (which lives in
 * env, not in the read model).
 *
 * All read endpoints (list/get inbound + outbound + by id) have moved
 * to the unified read model:
 *   GET /v1/query/emails               — list with filters (direction, domain, status)
 *   GET /v1/query/emails/:id           — single email (in or out)
 *   GET /v1/query/users/:id/emails     — user's emails (any direction)
 */
@Controller('v1/emails')
export class EmailController {
  constructor(private readonly emails: EmailService) {}

  @Post()
  send(@Body() dto: SendEmailDto) {
    return this.emails.send(dto);
  }

  // Multi-domain config (frontend dropdown). NOT in the read model — this
  // is config from EMAIL_DOMAINS_CONFIG, not user data.
  @Get('domains')
  listDomains() {
    return this.emails.listDomains();
  }

  // Inbound TTL cleanup — admin/cron action, not a read.
  @Post('inbound/cleanup-expired')
  cleanupInbound() {
    return this.emails.cleanupInbound();
  }
}
