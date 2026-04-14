import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { CreateScrapingTaskDto, NotifyNotionDto } from './dto';
export declare class ScrapingService {
    private readonly rabbitmq;
    private readonly logger;
    constructor(rabbitmq: RabbitMQService);
    createScrapingTask(dto: CreateScrapingTaskDto): Promise<{
        requestId: string;
        message: string;
        timestamp: string;
    }>;
    notifyNotion(dto: NotifyNotionDto): Promise<{
        requestId: string;
        message: string;
        timestamp: string;
    }>;
}
