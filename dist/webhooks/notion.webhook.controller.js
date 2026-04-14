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
var NotionWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionWebhookController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const notion_event_router_service_1 = require("../notion/services/notion-event-router.service");
let NotionWebhookController = NotionWebhookController_1 = class NotionWebhookController {
    constructor(config, eventRouter) {
        this.config = config;
        this.eventRouter = eventRouter;
        this.logger = new common_1.Logger(NotionWebhookController_1.name);
    }
    verifyWebhook(challenge) {
        if (!challenge) {
            this.logger.warn('Webhook verification request without challenge token');
            return '';
        }
        this.logger.log('Notion webhook verified successfully');
        return challenge;
    }
    async handleWebhook(body) {
        try {
            if (body && typeof body === 'object') {
                if (body.verification_token) {
                    this.logger.log(`🔐 NOTION WEBHOOK VERIFICATION RECEIVED`);
                    this.logger.log(`Verification token: ${body.verification_token}`);
                    this.logger.log(`✅ Save this token to .env as: NOTION_WEBHOOK_VERIFICATION_TOKEN=${body.verification_token}`);
                    return { received: true };
                }
                const eventType = body.type;
                if (!eventType) {
                    this.logger.warn('Received event without type field');
                    return { received: true };
                }
                this.logger.log(`Received Notion event: ${eventType}`);
                this.eventRouter.route(eventType, body);
                return { received: true };
            }
            this.logger.warn('Received invalid webhook body');
            return { received: true };
        }
        catch (error) {
            this.logger.error(`Error processing webhook: ${error.message}`);
            return { received: true };
        }
    }
    async testWebhook(body) {
        this.logger.log('TEST WEBHOOK received');
        if (body && typeof body === 'object') {
            const eventType = body.type;
            if (eventType) {
                this.logger.log(`Processing test event: ${eventType}`);
                this.eventRouter.route(eventType, body);
            }
        }
        return {
            received: true,
            bodyKeys: body ? Object.keys(body) : []
        };
    }
};
exports.NotionWebhookController = NotionWebhookController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('challenge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", String)
], NotionWebhookController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotionWebhookController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Post)('test'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotionWebhookController.prototype, "testWebhook", null);
exports.NotionWebhookController = NotionWebhookController = NotionWebhookController_1 = __decorate([
    (0, common_1.Controller)('webhooks/notion'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        notion_event_router_service_1.NotionEventRouterService])
], NotionWebhookController);
//# sourceMappingURL=notion.webhook.controller.js.map