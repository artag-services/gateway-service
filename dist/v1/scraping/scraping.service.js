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
var ScrapingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapingService = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../../rabbitmq/rabbitmq.service");
const queues_1 = require("../../rabbitmq/constants/queues");
const uuid_1 = require("uuid");
let ScrapingService = ScrapingService_1 = class ScrapingService {
    constructor(rabbitmq) {
        this.rabbitmq = rabbitmq;
        this.logger = new common_1.Logger(ScrapingService_1.name);
    }
    async createScrapingTask(dto) {
        const requestId = (0, uuid_1.v4)();
        const userId = dto.userId || 'anonymous';
        this.logger.log(`Creating scraping task: ${requestId} for URL: ${dto.url}`);
        try {
            const hasInstructions = dto.instructions && Object.keys(dto.instructions).length > 0;
            const scrapingType = dto.type || (hasInstructions ? 'simple' : 'auto');
            const scrapingMessage = {
                requestId,
                userId,
                url: dto.url,
                instructions: {
                    type: scrapingType,
                    action: `Scrape content from ${dto.url}`,
                    ...(hasInstructions ? dto.instructions : {}),
                    timeout: 30000,
                },
                timestamp: new Date().toISOString(),
            };
            this.rabbitmq.publish(queues_1.ROUTING_KEYS.SCRAPING_TASK, scrapingMessage);
            this.logger.log(`Scraping task published to RabbitMQ: ${requestId} (type: ${scrapingType})`);
            return {
                requestId,
                message: `Scraping task created and queued for processing: ${dto.url}`,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to create scraping task: ${error}`);
            throw error;
        }
    }
    async notifyNotion(dto) {
        const messageId = (0, uuid_1.v4)();
        this.logger.log(`📤 notifyNotion() - Publishing to Notion service`);
        this.logger.log(`   - messageId: ${messageId}`);
        this.logger.log(`   - userId: ${dto.userId}`);
        this.logger.log(`   - title: ${dto.title}`);
        try {
            const defaultParentPageId = this.configService.get('NOTION_PARENT_PAGE_ID');
            const parentPageId = dto.notionPageId || defaultParentPageId;
            this.logger.log(`   - Using parent_page_id: ${parentPageId}`);
            if (!dto.notionPageId && defaultParentPageId) {
                this.logger.log(`   - (from ENV fallback NOTION_PARENT_PAGE_ID)`);
            }
            const notionMessage = {
                messageId,
                operation: 'create_page',
                message: JSON.stringify(dto.data),
                metadata: {
                    parent_page_id: parentPageId,
                    title: dto.title,
                    icon: '🔗',
                    userId: dto.userId,
                    url: dto.url,
                },
                timestamp: new Date().toISOString(),
            };
            this.logger.log(`🚀 Publishing to RabbitMQ routing key: ${queues_1.ROUTING_KEYS.NOTION_SEND}`);
            this.rabbitmq.publish(queues_1.ROUTING_KEYS.NOTION_SEND, notionMessage);
            this.logger.log(`✅ Message published to Notion service | messageId=${messageId}`);
            return {
                requestId: messageId,
                message: `Notion notification queued for processing: ${dto.title}`,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            const err = error instanceof Error ? error.message : String(error);
            this.logger.error(`❌ Failed to notify Notion: ${err}`);
            throw error;
        }
    }
};
exports.ScrapingService = ScrapingService;
exports.ScrapingService = ScrapingService = ScrapingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService])
], ScrapingService);
//# sourceMappingURL=scraping.service.js.map