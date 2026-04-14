import { ConfigService } from '@nestjs/config';
import { WhatsappEventRouterService } from '../whatsapp/services/whatsapp-event-router.service';
export declare class WhatsappWebhookController {
    private readonly config;
    private readonly eventRouter;
    private readonly logger;
    constructor(config: ConfigService, eventRouter: WhatsappEventRouterService);
    verifyWebhook(mode: string, challenge: string, verifyToken: string): string;
    handleWebhook(body: any): Promise<{
        received: true;
    }>;
}
