import { Request } from 'express';
import { SlackEventRouterService } from '../slack/services/slack-event-router.service';
export declare class SlackWebhookController {
    private readonly slackEventRouter;
    private readonly logger;
    private readonly signingSecret;
    private readonly REQUEST_TIMEOUT_MS;
    constructor(slackEventRouter: SlackEventRouterService);
    healthCheck(): {
        ok: boolean;
        message: string;
    };
    receiveEvent(body: Record<string, unknown>, signature: string, timestamp: string, request: Request): Promise<Record<string, unknown>>;
    private validateSignature;
}
