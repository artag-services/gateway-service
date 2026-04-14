import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { InstagramEventRouterService } from '../instagram/services/instagram-event-router.service';
export declare class InstagramWebhookController {
    private readonly config;
    private readonly prisma;
    private readonly eventRouter;
    private readonly logger;
    constructor(config: ConfigService, prisma: PrismaService, eventRouter: InstagramEventRouterService);
    testWebhook(body: any): Promise<{
        received: true;
        bodyKeys: string[];
    }>;
    verifyWebhook(mode: string, challenge: string, verifyToken: string): string;
    handleWebhook(body: any, mode: string): Promise<{
        received: true;
    }>;
    private trackMessageInDatabase;
    private validateWebhookSignature;
}
