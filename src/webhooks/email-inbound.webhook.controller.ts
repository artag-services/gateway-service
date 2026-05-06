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
import { simpleParser } from 'mailparser'

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
  /** Raw RFC 5322 message — when present, parsed server-side via mailparser */
  rawBody?: string
  rawHeaders?: Record<string, unknown>
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

    // If the worker sent rawBody (RFC 5322), parse server-side. This is the
    // simple-worker path — no postal-mime / npm deps in the worker.
    let parsed: {
      fromName?: string
      subject?: string
      textBody?: string
      htmlBody?: string
      headers?: Record<string, unknown>
      attachments?: Array<{ name?: string; contentType?: string; size?: number }>
    } = {}

    if (body.rawBody) {
      try {
        const mail = await simpleParser(body.rawBody)
        const fromValue = (mail.from as { value?: Array<{ name?: string }> } | undefined)?.value?.[0]
        parsed = {
          fromName: fromValue?.name,
          subject: mail.subject ?? undefined,
          textBody: mail.text ?? undefined,
          htmlBody: typeof mail.html === 'string' ? mail.html : undefined,
          headers: body.rawHeaders ?? this.headersToObject(mail.headers as Map<string, unknown>),
          attachments: (mail.attachments ?? []).map((a) => ({
            name: a.filename,
            contentType: a.contentType,
            size: a.size,
          })),
        }
      } catch (err) {
        this.logger.warn(`mailparser failed: ${(err as Error).message} — falling back to raw fields`)
      }
    }

    const payload = {
      domain,
      toAddress,
      toAlias: body.toAlias ?? toAddress.split('@')[0],
      fromAddress,
      fromName: body.fromName ?? parsed.fromName,
      subject: body.subject ?? parsed.subject,
      textBody: body.textBody ?? body.text ?? parsed.textBody,
      htmlBody: body.htmlBody ?? body.html ?? parsed.htmlBody,
      headers: body.headers ?? parsed.headers,
      attachments: body.attachments ?? parsed.attachments,
      metadata: body.metadata,
    }

    this.logger.log(`📥 Inbound webhook: ${fromAddress} → ${toAddress} (${domain})`)
    this.rabbitmq.publish(ROUTING_KEYS.EMAIL_INBOUND_RECEIVED, payload)
    return { received: true }
  }

  private headersToObject(headers: Map<string, unknown> | undefined): Record<string, unknown> {
    if (!headers) return {}
    const obj: Record<string, unknown> = {}
    for (const [k, v] of headers.entries()) obj[k] = v
    return obj
  }
}
