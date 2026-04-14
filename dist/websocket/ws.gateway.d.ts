import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
export declare class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly rabbitmq;
    private readonly server;
    private readonly logger;
    constructor(rabbitmq: RabbitMQService);
    onModuleInit(): Promise<void>;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSendMessage(payload: Record<string, unknown>, client: Socket): {
        event: string;
        data: {
            clientId: string;
        };
    };
    emitMessageStatus(messageId: string, status: Record<string, unknown>): void;
    private handleServiceResponse;
}
