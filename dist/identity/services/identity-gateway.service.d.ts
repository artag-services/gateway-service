import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
export declare class IdentityGatewayService {
    private rabbitmqService;
    private readonly logger;
    constructor(rabbitmqService: RabbitMQService);
    resolveIdentity(data: any): Promise<void>;
    publishPhoneNumberUpdate(data: any): Promise<void>;
}
