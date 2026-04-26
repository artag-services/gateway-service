import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Webhook, WebhookVerificationError } from 'svix';

import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { ROUTING_KEYS } from '../rabbitmq/constants/queues';

/**
 * Receives Resend webhooks at /api/webhooks/resend.
 *
 * Per the project pattern: only the gateway is exposed to external providers.
 * Each event is bridged into the `channels` exchange under
 * `channels.email.webhook.resend`; the email microservice consumes it and
 * updates message state.
 *
 * Signature verification: Resend signs webhooks using Svix. We verify the
 * `svix-id` + `svix-timestamp` + `svix-signature` headers against the raw
 * body (captured by the global middleware in main.ts) using the
 * `RESEND_WEBHOOK_SECRET` env var. If the secret is unset we log a loud
 * warning and accept the event (useful for local dev only).
 */
@Controller('webhooks/resend')
export class ResendWebhookController {
  private readonly logger = new Logger(ResendWebhookController.name);
  private readonly verifier: Webhook | null;

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly config: ConfigService,
  ) {
    const secret = this.config.get<string>('RESEND_WEBHOOK_SECRET');
    this.verifier = secret ? new Webhook(secret) : null;
    if (!secret) {
      this.logger.warn(
        'RESEND_WEBHOOK_SECRET not set — webhooks will be accepted UNVERIFIED. Do not run like this in production.',
      );
    }
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async receive(
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
    @Headers('svix-id') svixId?: string,
    @Headers('svix-timestamp') svixTimestamp?: string,
    @Headers('svix-signature') svixSignature?: string,
  ): Promise<{ received: true }> {
    if (this.verifier) {
      const rawBody = (req as unknown as { rawBody?: string }).rawBody;
      if (!rawBody || !svixId || !svixTimestamp || !svixSignature) {
        this.logger.warn('Webhook missing raw body or svix-* headers');
        throw new UnauthorizedException('Missing webhook signature headers');
      }
      try {
        this.verifier.verify(rawBody, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        });
      } catch (err) {
        if (err instanceof WebhookVerificationError) {
          this.logger.warn(`Webhook signature verification failed: ${err.message}`);
          throw new UnauthorizedException('Invalid webhook signature');
        }
        throw err;
      }
    }

    const type = body?.type;
    this.logger.log(`Resend webhook verified: type=${type}`);

    this.rabbitmq.publish(ROUTING_KEYS.EMAIL_WEBHOOK_RESEND, body);
    return { received: true };
  }
}
