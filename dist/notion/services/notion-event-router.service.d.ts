import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
export declare class NotionEventRouterService {
    private readonly rabbitmq;
    private readonly logger;
    private readonly eventTypeToRoutingKey;
    constructor(rabbitmq: RabbitMQService);
    route(eventType: string, payload: any): void;
}
