import { ScrapingService } from './scraping.service';
import { CreateScrapingTaskDto, ScrapingTaskResponseDto, NotifyNotionDto } from './dto';
export declare class ScrapingController {
    private readonly scrapingService;
    private readonly logger;
    constructor(scrapingService: ScrapingService);
    createTask(dto: CreateScrapingTaskDto): Promise<ScrapingTaskResponseDto>;
    notifyNotion(dto: NotifyNotionDto): Promise<{
        requestId: string;
        message: string;
        timestamp: string;
    }>;
}
