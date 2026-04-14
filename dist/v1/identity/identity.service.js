"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var IdentityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityService = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../../rabbitmq/rabbitmq.service");
const request_response_manager_1 = require("../../identity/services/request-response.manager");
const queues_1 = require("../../rabbitmq/constants/queues");
let IdentityService = IdentityService_1 = class IdentityService {
    constructor(rabbitmq, requestResponseManager) {
        this.rabbitmq = rabbitmq;
        this.requestResponseManager = requestResponseManager;
        this.logger = new common_1.Logger(IdentityService_1.name);
    }
    async resolveIdentity(dto) {
        if (!dto.channel || !dto.channelUserId) {
            throw new common_1.BadRequestException('Channel and channelUserId are required');
        }
        this.logger.log(`Publishing resolve identity - Channel: ${dto.channel}, ID: ${dto.channelUserId}`);
        await this.rabbitmq.publish(queues_1.ROUTING_KEYS.IDENTITY_RESOLVE, {
            channel: dto.channel,
            channelUserId: dto.channelUserId,
            displayName: dto.displayName,
            phone: dto.phone,
            email: dto.email,
            username: dto.username,
            avatarUrl: dto.avatarUrl,
            trustScore: dto.trustScore,
            metadata: dto.metadata,
        });
        return {
            success: true,
            message: 'Identity resolution queued',
        };
    }
    async getAllUsers(filters) {
        this.logger.log('Publishing get all users request');
        const { correlationId, promise } = this.requestResponseManager.createRequest();
        await this.rabbitmq.publish(queues_1.ROUTING_KEYS.IDENTITY_GET_ALL_USERS, {
            correlationId,
            filters,
        });
        try {
            const response = await promise;
            return response.users || [];
        }
        catch (error) {
            this.logger.error(`Error getting users: ${error.message}`);
            throw error;
        }
    }
    async getUser(userId) {
        this.logger.log(`Publishing get user ${userId} request`);
        const { correlationId, promise } = this.requestResponseManager.createRequest();
        await this.rabbitmq.publish(queues_1.ROUTING_KEYS.IDENTITY_GET_USER, {
            correlationId,
            userId,
        });
        try {
            const response = await promise;
            return response.user || null;
        }
        catch (error) {
            this.logger.error(`Error getting user: ${error.message}`);
            throw error;
        }
    }
    async mergeUsers(dto) {
        if (!dto.primaryUserId || !dto.secondaryUserId) {
            throw new common_1.BadRequestException('Both user IDs are required');
        }
        this.logger.log(`Publishing merge users - Primary: ${dto.primaryUserId}, Secondary: ${dto.secondaryUserId}`);
        await this.rabbitmq.publish(queues_1.ROUTING_KEYS.IDENTITY_MERGE_USERS, {
            primaryUserId: dto.primaryUserId,
            secondaryUserId: dto.secondaryUserId,
            reason: dto.reason,
        });
        return {
            success: true,
            message: 'User merge queued',
        };
    }
    async deleteUser(userId) {
        this.logger.log(`Publishing delete user ${userId} request`);
        await this.rabbitmq.publish(queues_1.ROUTING_KEYS.IDENTITY_DELETE_USER, {
            userId,
        });
        return {
            success: true,
            message: 'User deletion queued',
        };
    }
    async getReport() {
        this.logger.log('Publishing get report request');
        const { correlationId, promise } = this.requestResponseManager.createRequest();
        await this.rabbitmq.publish(queues_1.ROUTING_KEYS.IDENTITY_GET_REPORT, {
            correlationId,
        });
        try {
            const response = await promise;
            return response.report || {};
        }
        catch (error) {
            this.logger.error(`Error getting report: ${error.message}`);
            throw error;
        }
    }
    async updateAISettings(userId, dto) {
        if (!userId) {
            throw new common_1.BadRequestException('userId is required');
        }
        this.logger.log(`Publishing update AI settings for user ${userId} - aiEnabled: ${dto.aiEnabled}`);
        await this.rabbitmq.publish(queues_1.ROUTING_KEYS.IDENTITY_UPDATE_AI_SETTINGS, {
            userId,
            aiEnabled: dto.aiEnabled,
            timestamp: Date.now(),
        });
        return {
            success: true,
            message: 'AI settings update queued',
        };
    }
};
exports.IdentityService = IdentityService;
exports.IdentityService = IdentityService = IdentityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService,
        request_response_manager_1.RequestResponseManager])
], IdentityService);
//# sourceMappingURL=identity.service.js.map