import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { WhatsappEventPayload } from '../constants/events';
export declare class ScrapingMessageInterceptor {
    private readonly rabbitmq;
    private readonly logger;
    private readonly scrapingKeywords;
    constructor(rabbitmq: RabbitMQService);
    isScrapingRequest(payload: WhatsappEventPayload): boolean;
    extractScrapingTask(payload: WhatsappEventPayload): ScrapingTask | null;
    handleScrapingRequest(payload: WhatsappEventPayload): Promise<void>;
    private parseScrapingParams;
    private parseSelectorsFromTask;
    private parseCredentialsFromTask;
}
export interface ScrapingTask {
    userId: string;
    url: string;
    type: 'simple' | 'login' | 'search' | 'login+search' | 'extract';
    selectors?: string[];
    waitFor?: string;
    credentials?: {
        email?: string;
        password?: string;
        username?: string;
    };
    searchQuery?: string;
    timestamp: number;
    originalMessage: string;
}
