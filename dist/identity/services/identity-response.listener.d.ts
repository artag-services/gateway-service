import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { RequestResponseManager } from './request-response.manager';
export declare class IdentityResponseListener implements OnModuleInit, OnModuleDestroy {
    private rabbitmq;
    private requestResponseManager;
    private readonly logger;
    constructor(rabbitmq: RabbitMQService, requestResponseManager: RequestResponseManager);
    onModuleInit(): Promise<void>;
    private handleResponse;
    onModuleDestroy(): void;
}
