import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
export declare class SlackEventRouterService {
    private readonly rabbitmq;
    private readonly logger;
    private readonly eventTypeToRoutingKey;
    constructor(rabbitmq: RabbitMQService);
    routeEvent(eventType: string, payload: Record<string, unknown>): Promise<void>;
}
