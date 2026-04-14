export declare class CreateScrapingTaskDto {
    url: string;
    type?: 'simple' | 'login' | 'search' | 'login+search' | 'extract';
    instructions?: Record<string, any>;
    userId?: string;
}
