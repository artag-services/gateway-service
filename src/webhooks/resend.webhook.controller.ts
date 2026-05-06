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
 * Multi-account support: Resend signing secrets vary per account. We try
 * EVERY configured secret in order; the first that verifies wins. Configure
 * via either:
 *   - `RESEND_WEBHOOK_SECRETS` (comma-separated, recommended for multi-account)
 *   - `RESEND_WEBHOOK_SECRET`  (single secret, legacy)
 *
 * If neither is configured, webhooks are accepted unverified with a loud
 * warning (dev only — never run like this in production).
 */
@Controller('webhooks/resend')
export class ResendWebhookController {
  private readonly logger = new Logger(ResendWebhookController.name);
  private readonly verifiers: Webhook[];

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly config: ConfigService,
  ) {
    this.verifiers = this.parseSecrets().map((secret) => new Webhook(secret));
    if (this.verifiers.length === 0) {
      this.logger.warn(
        'No RESEND_WEBHOOK_SECRET(S) configured — webhooks will be accepted UNVERIFIED. Do not run like this in production.',
      );
    } else {
      this.logger.log(`ResendWebhookController ready with ${this.verifiers.length} signing secret(s)`);
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
    if (this.verifiers.length > 0) {
      const rawBody = (req as unknown as { rawBody?: string }).rawBody;
      if (!rawBody || !svixId || !svixTimestamp || !svixSignature) {
        this.logger.warn('Webhook missing raw body or svix-* headers');
        throw new UnauthorizedException('Missing webhook signature headers');
      }

      // Try each configured secret — first to verify wins
      let verified = false;
      let lastError: Error | null = null;
      for (const verifier of this.verifiers) {
        try {
          verifier.verify(rawBody, {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature,
          });
          verified = true;
          break;
        } catch (err) {
          lastError = err as Error;
          // continue to next secret
        }
      }

      if (!verified) {
        if (lastError instanceof WebhookVerificationError) {
          this.logger.warn(`Webhook signature did not match any configured secret: ${lastError.message}`);
        }
        throw new UnauthorizedException('Invalid webhook signature');
      }
    }

    const type = body?.type;
    this.logger.log(`Resend webhook verified: type=${type}`);

    this.rabbitmq.publish(ROUTING_KEYS.EMAIL_WEBHOOK_RESEND, body);
    return { received: true };
  }

  private parseSecrets(): string[] {
    const multi = this.config.get<string>('RESEND_WEBHOOK_SECRETS');
    if (multi) {
      return multi.split(',').map((s) => s.trim()).filter(Boolean);
    }
    const single = this.config.get<string>('RESEND_WEBHOOK_SECRET');
    return single ? [single] : [];
  }
}
