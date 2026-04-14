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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityController = void 0;
const common_1 = require("@nestjs/common");
const identity_service_1 = require("./identity.service");
const dto_1 = require("./dto");
let IdentityController = class IdentityController {
    constructor(identityService) {
        this.identityService = identityService;
    }
    async resolveIdentity(dto) {
        return this.identityService.resolveIdentity(dto);
    }
    async getAllUsers(channel, includeDeleted) {
        const filters = {
            channel: channel || undefined,
            includeDeleted: includeDeleted === 'true',
        };
        return this.identityService.getAllUsers(filters);
    }
    async getUser(userId) {
        if (!userId) {
            throw new common_1.BadRequestException('userId is required');
        }
        return this.identityService.getUser(userId);
    }
    async mergeUsers(dto) {
        return this.identityService.mergeUsers(dto);
    }
    async deleteUser(userId) {
        if (!userId) {
            throw new common_1.BadRequestException('userId is required');
        }
        return this.identityService.deleteUser(userId);
    }
    async getReport() {
        return this.identityService.getReport();
    }
    async updateAISettings(userId, dto) {
        if (!userId) {
            throw new common_1.BadRequestException('userId is required');
        }
        return this.identityService.updateAISettings(userId, dto);
    }
};
exports.IdentityController = IdentityController;
__decorate([
    (0, common_1.Post)('resolve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ResolveIdentityDto]),
    __metadata("design:returntype", Promise)
], IdentityController.prototype, "resolveIdentity", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('channel')),
    __param(1, (0, common_1.Query)('includeDeleted')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], IdentityController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('users/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IdentityController.prototype, "getUser", null);
__decorate([
    (0, common_1.Post)('merge'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.MergeUsersDto]),
    __metadata("design:returntype", Promise)
], IdentityController.prototype, "mergeUsers", null);
__decorate([
    (0, common_1.Delete)('users/:userId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IdentityController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('report'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IdentityController.prototype, "getReport", null);
__decorate([
    (0, common_1.Patch)('users/:userId/ai-settings'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateAISettingsDto]),
    __metadata("design:returntype", Promise)
], IdentityController.prototype, "updateAISettings", null);
exports.IdentityController = IdentityController = __decorate([
    (0, common_1.Controller)('v1/identity'),
    __metadata("design:paramtypes", [identity_service_1.IdentityService])
], IdentityController);
//# sourceMappingURL=identity.controller.js.map