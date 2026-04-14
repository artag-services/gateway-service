import { OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../../../rabbitmq/rabbitmq.service';
import { MessagesService } from '../../messages/messages.service';
import { ConfigService } from '@nestjs/config';
export declare class ScrapingResponseListener implements OnModuleInit {
    private readonly rabbitmq;
    private readonly messagesService;
    private readonly configService;
    private readonly logger;
    private readonly personalWhatsappNumber;
    constructor(rabbitmq: RabbitMQService, messagesService: MessagesService, configService: ConfigService);
    onModuleInit(): Promise<void>;
    private handleNotionResponse;
}
