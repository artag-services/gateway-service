import { ConfigService } from '@nestjs/config';
import { NotionEventRouterService } from '../notion/services/notion-event-router.service';
export declare class NotionWebhookController {
    private readonly config;
    private readonly eventRouter;
    private readonly logger;
    constructor(config: ConfigService, eventRouter: NotionEventRouterService);
    verifyWebhook(challenge: string): string;
    handleWebhook(body: any): Promise<{
        received: true;
    }>;
    testWebhook(body: any): Promise<{
        received: true;
        bodyKeys: string[];
    }>;
}
