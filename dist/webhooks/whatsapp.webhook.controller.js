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
var WhatsappWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappWebhookController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const whatsapp_event_router_service_1 = require("../whatsapp/services/whatsapp-event-router.service");
let WhatsappWebhookController = WhatsappWebhookController_1 = class WhatsappWebhookController {
    constructor(config, eventRouter) {
        this.config = config;
        this.eventRouter = eventRouter;
        this.logger = new common_1.Logger(WhatsappWebhookController_1.name);
    }
    verifyWebhook(mode, challenge, verifyToken) {
        const token = this.config.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN');
        if (mode !== 'subscribe' || verifyToken !== token) {
            this.logger.warn('Invalid webhook verification attempt');
            return '';
        }
        this.logger.log('Webhook verified successfully');
        return challenge;
    }
    async handleWebhook(body) {
        this.logger.log(`Received webhook event: ${JSON.stringify(body)}`);
        if (body.entry && Array.isArray(body.entry)) {
            for (const entry of body.entry) {
                if (entry.changes && Array.isArray(entry.changes)) {
                    for (const change of entry.changes) {
                        await this.eventRouter.route(change.field, change.value, entry.time);
                    }
                }
            }
        }
        return { received: true };
    }
};
exports.WhatsappWebhookController = WhatsappWebhookController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('hub.mode')),
    __param(1, (0, common_1.Query)('hub.challenge')),
    __param(2, (0, common_1.Query)('hub.verify_token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", String)
], WhatsappWebhookController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappWebhookController.prototype, "handleWebhook", null);
exports.WhatsappWebhookController = WhatsappWebhookController = WhatsappWebhookController_1 = __decorate([
    (0, common_1.Controller)('webhooks/whatsapp'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        whatsapp_event_router_service_1.WhatsappEventRouterService])
], WhatsappWebhookController);
//# sourceMappingURL=whatsapp.webhook.controller.js.map