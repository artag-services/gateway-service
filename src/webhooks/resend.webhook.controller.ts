import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { ROUTING_KEYS } from '../rabbitmq/constants/queues';

/**
 * Receives Resend webhooks at /api/webhooks/resend.
 *
 * Per the project pattern: only the gateway is exposed to external providers.
 * We bridge each event into the `channels` exchange under
 * `channels.email.webhook.resend` — the email microservice consumes it and
 * updates message state.
 *
 * Signature validation: if RESEND_WEBHOOK_SECRET is configured we log a
 * warning that full signature verification (svix-id + svix-timestamp +
 * svix-signature against raw body) is pending. Wire that up when ready —
 * Express raw body capture in main.ts is required first.
 */
@Controller('webhooks/resend')
export class ResendWebhookController {
  private readonly logger = new Logger(ResendWebhookController.name);

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  receive(
    @Body() payload: Record<string, unknown>,
    @Headers('svix-id') svixId?: string,
    @Headers('svix-timestamp') svixTimestamp?: string,
    @Headers('svix-signature') svixSignature?: string,
  ): { received: true } {
    const secret = this.config.get<string>('RESEND_WEBHOOK_SECRET');
    if (secret && (!svixId || !svixTimestamp || !svixSignature)) {
      this.logger.warn('Webhook missing svix-* headers but secret is configured');
    }
    if (!secret) {
      this.logger.warn(
        'RESEND_WEBHOOK_SECRET not set — webhook accepted without signature verification',
      );
    }

    const type = payload?.type;
    this.logger.log(`Resend webhook received: type=${type}`);

    this.rabbitmq.publish(ROUTING_KEYS.EMAIL_WEBHOOK_RESEND, payload);
    return { received: true };
  }
}
