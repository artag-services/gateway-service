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
var InstagramWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramWebhookController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const instagram_event_router_service_1 = require("../instagram/services/instagram-event-router.service");
let InstagramWebhookController = InstagramWebhookController_1 = class InstagramWebhookController {
    constructor(config, prisma, eventRouter) {
        this.config = config;
        this.prisma = prisma;
        this.eventRouter = eventRouter;
        this.logger = new common_1.Logger(InstagramWebhookController_1.name);
    }
    async testWebhook(body) {
        console.log('\n\n🧪 TEST WEBHOOK POST RECEIVED 🧪');
        console.log('Type of body:', typeof body);
        console.log('Body is array?:', Array.isArray(body));
        console.log('Body keys:', Object.keys(body));
        console.log('Full body:', JSON.stringify(body, null, 2));
        if (body && body.entry && Array.isArray(body.entry)) {
            console.log('✅ Found entry array with', body.entry.length, 'entries');
            for (const entry of body.entry) {
                if (entry.changes && Array.isArray(entry.changes)) {
                    console.log('✅ Found changes array with', entry.changes.length, 'changes');
                    for (const change of entry.changes) {
                        this.eventRouter.route(change.field, change.value, entry.time);
                        if (change.field === 'messages' && change.value) {
                            console.log('✅ Processing messages change');
                            await this.trackMessageInDatabase(entry.time, change.value).catch((err) => {
                                console.error('Failed to track message:', err);
                            });
                        }
                    }
                }
            }
        }
        else {
            console.log('❌ No entry array found. Body:', body);
        }
        return { received: true, bodyKeys: Object.keys(body) };
    }
    verifyWebhook(mode, challenge, verifyToken) {
        const token = this.config.get('INSTAGRAM_WEBHOOK_VERIFY_TOKEN');
        if (mode !== 'subscribe' || verifyToken !== token) {
            this.logger.warn('Invalid webhook verification attempt');
            return '';
        }
        this.logger.log('Webhook verified successfully');
        return challenge;
    }
    async handleWebhook(body, mode) {
        this.logger.log(`Received webhook event: ${JSON.stringify(body)}`);
        const signature = this.validateWebhookSignature(body);
        if (!signature) {
            this.logger.warn('Invalid webhook signature');
            return { received: true };
        }
        if (body.entry && Array.isArray(body.entry)) {
            for (const entry of body.entry) {
                if (entry.changes && Array.isArray(entry.changes)) {
                    for (const change of entry.changes) {
                        this.eventRouter.route(change.field, change.value, entry.time);
                        if (change.field === 'messages' && change.value) {
                            await this.trackMessageInDatabase(entry.time, change.value).catch((err) => {
                                this.logger.error(`Failed to track message in database: ${err.message}`);
                            });
                        }
                    }
                }
                else if (entry.messaging && Array.isArray(entry.messaging)) {
                    for (const msg of entry.messaging) {
                        if (msg.message) {
                            const instagramFormatted = {
                                sender: msg.sender,
                                recipient: msg.recipient,
                                timestamp: entry.time,
                                message: msg.message,
                            };
                            this.eventRouter.route('messages', instagramFormatted, entry.time);
                            await this.trackMessageInDatabase(entry.time, instagramFormatted).catch((err) => {
                                this.logger.error(`Failed to track message in database: ${err.message}`);
                            });
                        }
                    }
                }
            }
        }
        return { received: true };
    }
    async trackMessageInDatabase(entryTime, eventValue) {
        try {
            const senderId = eventValue.sender?.id;
            const recipientId = eventValue.recipient?.id;
            let timestamp = eventValue.timestamp || entryTime;
            if (eventValue.message) {
                const message = eventValue.message;
                const messageId = message.mid;
                const text = message.text || '';
                const attachments = message.attachments || [];
                this.logger.log(`New message from ${senderId}: "${text}"`);
                if (!timestamp || timestamp === 'Invalid Date') {
                    timestamp = Date.now();
                }
                let timestampMs = timestamp;
                if (typeof timestamp === 'string') {
                    timestampMs = parseInt(timestamp) * 1000;
                }
                else if (typeof timestamp === 'number' && timestamp < 10000000000) {
                    timestampMs = timestamp * 1000;
                }
                await this.prisma.igMessage
                    .create({
                    data: {
                        messageId,
                        recipient: senderId,
                        body: text,
                        mediaUrl: attachments?.[0]?.payload?.url || null,
                        status: 'PENDING',
                        sentAt: new Date(timestampMs),
                    },
                })
                    .catch((err) => {
                    if (err.code === 'P2002') {
                        return this.prisma.igMessage.update({
                            where: { messageId },
                            data: {
                                body: text,
                                mediaUrl: attachments?.[0]?.payload?.url || null,
                            },
                        });
                    }
                    throw err;
                });
                this.logger.log(`📲 INSTAGRAM IGSID DETECTED: ${senderId}`);
            }
        }
        catch (error) {
            throw error;
        }
    }
    validateWebhookSignature(body) {
        return true;
    }
};
exports.InstagramWebhookController = InstagramWebhookController;
__decorate([
    (0, common_1.Post)('test'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InstagramWebhookController.prototype, "testWebhook", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('hub.mode')),
    __param(1, (0, common_1.Query)('hub.challenge')),
    __param(2, (0, common_1.Query)('hub.verify_token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", String)
], InstagramWebhookController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('hub.mode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InstagramWebhookController.prototype, "handleWebhook", null);
exports.InstagramWebhookController = InstagramWebhookController = InstagramWebhookController_1 = __decorate([
    (0, common_1.Controller)('webhooks/instagram'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService,
        instagram_event_router_service_1.InstagramEventRouterService])
], InstagramWebhookController);
//# sourceMappingURL=instagram.webhook.controller.js.map