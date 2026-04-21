import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { ScrapingMessageInterceptor } from './scraping-message.interceptor';
export declare class WhatsappEventRouterService {
    private readonly rabbitmq;
    private readonly scrapingInterceptor;
    private readonly logger;
    private readonly eventTypeToRoutingKey;
    constructor(rabbitmq: RabbitMQService, scrapingInterceptor: ScrapingMessageInterceptor);
    route(field: string, value: any, entryTime: number): Promise<void>;
    private publishConversationIncomingEvent;
}
