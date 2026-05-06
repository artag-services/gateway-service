import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHmac, timingSafeEqual } from 'crypto'

import { RabbitMQService } from '../rabbitmq/rabbitmq.service'
import { ROUTING_KEYS } from '../rabbitmq/constants/queues'

interface InboundEmailBody {
  domain?: string
  toAddress?: string
  to?: string
  toAlias?: string
  fromAddress?: string
  from?: string
  fromName?: string
  subject?: string
  textBody?: string
  htmlBody?: string
  text?: string
  html?: string
  headers?: Record<string, unknown>
  attachments?: Array<{ name?: string; contentType?: string; size?: number }>
  metadata?: Record<string, unknown>
}

/**
 * Receives parsed inbound emails from Cloudflare Email Workers (one per
 * domain). Each worker computes an HMAC-SHA256 signature over the raw
 * request body using `INBOUND_EMAIL_WEBHOOK_SECRET` and sends it in the
 * `X-Inbound-Signature` header.
 *
 * The same shared secret works across multiple Cloudflare accounts because
 * it's just a static HMAC key — no provider-specific logic.
 *
 * On verified delivery, we normalize the payload and bridge it to RabbitMQ
 * at `channels.email.inbound.received`. The email microservice consumes it,
 * persists, and fires `identity.resolve` to backfill userId.
 */
@Controller('webhooks/email/inbound')
export class EmailInboundWebhookController {
  private readonly logger = new Logger(EmailInboundWebhookController.name)
  private readonly secret: string | undefined

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly config: ConfigService,
  ) {
    this.secret = this.config.get<string>('INBOUND_EMAIL_WEBHOOK_SECRET')
    if (!this.secret) {
      this.logger.warn(
        'INBOUND_EMAIL_WEBHOOK_SECRET not set — inbound emails will be accepted UNVERIFIED. Do not run like this in production.',
      )
    }
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async receive(
    @Body() body: InboundEmailBody,
    @Headers('x-inbound-signature') signature?: string,
  ): Promise<{ received: true }> {
    if (this.secret) {
      if (!signature) {
        throw new UnauthorizedException('Missing X-Inbound-Signature header')
      }
      const expected = createHmac('sha256', this.secret)
        .update(JSON.stringify(body))
        .digest('hex')
      const expectedBuf = Buffer.from(expected, 'hex')
      const actualBuf = Buffer.from(signature.replace(/^sha256=/, ''), 'hex')
      if (
        expectedBuf.length !== actualBuf.length ||
        !timingSafeEqual(expectedBuf, actualBuf)
      ) {
        throw new UnauthorizedException('Invalid X-Inbound-Signature')
      }
    }

    // Normalize: workers may use either `to` or `toAddress`, etc.
    const toAddress = (body.toAddress ?? body.to ?? '').toLowerCase()
    const fromAddress = (body.fromAddress ?? body.from ?? '').toLowerCase()
    const domain = body.domain?.toLowerCase() ?? toAddress.split('@')[1] ?? 'unknown'

    if (!toAddress || !fromAddress) {
      throw new UnauthorizedException('Missing to/from in inbound payload')
    }

    const payload = {
      domain,
      toAddress,
      toAlias: body.toAlias ?? toAddress.split('@')[0],
      fromAddress,
      fromName: body.fromName,
      subject: body.subject,
      textBody: body.textBody ?? body.text,
      htmlBody: body.htmlBody ?? body.html,
      headers: body.headers,
      attachments: body.attachments,
      metadata: body.metadata,
    }

    this.logger.log(`📥 Inbound webhook: ${fromAddress} → ${toAddress} (${domain})`)
    this.rabbitmq.publish(ROUTING_KEYS.EMAIL_INBOUND_RECEIVED, payload)
    return { received: true }
  }
}
