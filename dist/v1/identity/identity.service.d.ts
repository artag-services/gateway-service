import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { RequestResponseManager } from '../../identity/services/request-response.manager';
import { ResolveIdentityDto, MergeUsersDto, UpdateAISettingsDto } from './dto';
export declare class IdentityService {
    private rabbitmq;
    private requestResponseManager;
    private readonly logger;
    constructor(rabbitmq: RabbitMQService, requestResponseManager: RequestResponseManager);
    resolveIdentity(dto: ResolveIdentityDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllUsers(filters?: {
        channel?: string;
        includeDeleted?: boolean;
    }): Promise<any>;
    getUser(userId: string): Promise<any>;
    mergeUsers(dto: MergeUsersDto): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteUser(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getReport(): Promise<any>;
    updateAISettings(userId: string, dto: UpdateAISettingsDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
