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

  @Get()
  list(@Query('limit') limit?: string) {
    return this.emails.list(limit ? parseInt(limit, 10) : undefined);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.emails.get(id);
  }

  @Post()
  send(@Body() dto: SendEmailDto) {
    return this.emails.send(dto);
  }
}
