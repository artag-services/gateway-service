import { Controller, Get, Logger, Query, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { v4 as uuid } from 'uuid'
import { EventsService } from './events.service'

/**
 * Server-Sent Events endpoint. Frontend usage:
 *
 *   const es = new EventSource('/api/v1/events?topics=scraping:abc,email:xyz')
 *   es.addEventListener('scraping:completed', e => console.log(JSON.parse(e.data)))
 *   es.addEventListener('email:delivered', e => ...)
 *
 * Topics syntax:
 *   - `<service>:<id>`   subscribe to a specific entity (e.g. `scraping:abc-uuid`)
 *   - `<service>:*`      subscribe to all events of a service
 *   - `*`                subscribe to everything (debugging only)
 *
 * The connection stays open with a heartbeat every 25s. The browser auto-
 * reconnects on disconnect (native EventSource behavior).
 */
@Controller('v1/events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name)

  constructor(private readonly events: EventsService) {}

  @Get()
  stream(
    @Query('topics') topicsQuery: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): void {
    const topics = (topicsQuery ?? '*')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no') // disables buffering on nginx
    res.flushHeaders()

    const clientId = uuid()
    this.events.register(clientId, topics, res)

    req.on('close', () => {
      this.events.unregister(clientId)
    })
  }
}
