import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
export declare class MessagesController {
    private readonly messages;
    constructor(messages: MessagesService);
    send(dto: SendMessageDto): Promise<MessageResponseDto>;
    getInstagramConversations(): Promise<Array<{
        conversationId: string;
        igsid: string;
        username?: string;
    }>>;
    sendToInstagramUser(igsid: string, body: {
        message: string;
        mediaUrl?: string;
    }): Promise<{
        messageId: string;
        igsid: string;
        status: 'SENT' | 'FAILED';
        timestamp: string;
    }>;
    findOne(id: string): Promise<MessageResponseDto>;
}
