import { IdentityService } from './identity.service';
import { ResolveIdentityDto, MergeUsersDto, UpdateAISettingsDto } from './dto';
export declare class IdentityController {
    private readonly identityService;
    constructor(identityService: IdentityService);
    resolveIdentity(dto: ResolveIdentityDto): Promise<any>;
    getAllUsers(channel?: string, includeDeleted?: string): Promise<any>;
    getUser(userId: string): Promise<any>;
    mergeUsers(dto: MergeUsersDto): Promise<any>;
    deleteUser(userId: string): Promise<any>;
    getReport(): Promise<any>;
    updateAISettings(userId: string, dto: UpdateAISettingsDto): Promise<any>;
}
