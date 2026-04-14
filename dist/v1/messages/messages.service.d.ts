import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
export declare class MessagesService {
    private readonly prisma;
    private readonly rabbitmq;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, rabbitmq: RabbitMQService, config: ConfigService);
    send(dto: SendMessageDto): Promise<MessageResponseDto>;
    findOne(id: string): Promise<MessageResponseDto | null>;
    updateStatus(messageId: string, status: string): Promise<void>;
    getInstagramConversations(): Promise<Array<{
        conversationId: string;
        igsid: string;
        username?: string;
    }>>;
    sendToInstagramUser(igsid: string, message: string, mediaUrl?: string): Promise<{
        messageId: string;
        igsid: string;
        status: 'SENT' | 'FAILED';
        timestamp: string;
    }>;
}
