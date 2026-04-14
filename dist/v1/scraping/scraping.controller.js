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
var ScrapingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapingController = void 0;
const common_1 = require("@nestjs/common");
const scraping_service_1 = require("./scraping.service");
const dto_1 = require("./dto");
let ScrapingController = ScrapingController_1 = class ScrapingController {
    constructor(scrapingService) {
        this.scrapingService = scrapingService;
        this.logger = new common_1.Logger(ScrapingController_1.name);
    }
    async createTask(dto) {
        this.logger.log(`Received scraping request for URL: ${dto.url}`);
        if (!dto.url) {
            throw new common_1.BadRequestException('URL is required');
        }
        try {
            const result = await this.scrapingService.createScrapingTask(dto);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to create scraping task: ${error}`);
            throw error;
        }
    }
    async notifyNotion(dto) {
        this.logger.log(`📨 Received notify-notion request from Scraping Service`);
        this.logger.log(`   - userId: ${dto.userId}`);
        this.logger.log(`   - title: ${dto.title}`);
        this.logger.log(`   - url: ${dto.url}`);
        if (!dto.userId || !dto.title || !dto.data) {
            throw new common_1.BadRequestException('userId, title, and data are required');
        }
        try {
            const result = await this.scrapingService.notifyNotion(dto);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to notify Notion: ${error}`);
            throw error;
        }
    }
};
exports.ScrapingController = ScrapingController;
__decorate([
    (0, common_1.Post)('tasks'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateScrapingTaskDto]),
    __metadata("design:returntype", Promise)
], ScrapingController.prototype, "createTask", null);
__decorate([
    (0, common_1.Post)('notify-notion'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.NotifyNotionDto]),
    __metadata("design:returntype", Promise)
], ScrapingController.prototype, "notifyNotion", null);
exports.ScrapingController = ScrapingController = ScrapingController_1 = __decorate([
    (0, common_1.Controller)('v1/scraping'),
    __metadata("design:paramtypes", [scraping_service_1.ScrapingService])
], ScrapingController);
//# sourceMappingURL=scraping.controller.js.map