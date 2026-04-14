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
var SlackWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackWebhookController = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const slack_event_router_service_1 = require("../slack/services/slack-event-router.service");
const event_type_helper_1 = require("../slack/utils/event-type.helper");
let SlackWebhookController = SlackWebhookController_1 = class SlackWebhookController {
    constructor(slackEventRouter) {
        this.slackEventRouter = slackEventRouter;
        this.logger = new common_1.Logger(SlackWebhookController_1.name);
        this.signingSecret = process.env.SLACK_SIGNING_SECRET;
        this.REQUEST_TIMEOUT_MS = 5 * 60 * 1000;
        if (!this.signingSecret) {
            this.logger.warn('SLACK_SIGNING_SECRET not configured. Webhook signature validation will be skipped.');
        }
    }
    healthCheck() {
        return { ok: true, message: 'Slack webhook ready' };
    }
    async receiveEvent(body, signature, timestamp, request) {
        try {
            this.logger.debug(`=== SLACK WEBHOOK DEBUG ===`);
            this.logger.debug(`Body type: ${typeof body}`);
            this.logger.debug(`Body keys: ${body ? Object.keys(body).join(', ') : 'null'}`);
            this.logger.debug(`Body.type: ${body['type']}`);
            this.logger.debug(`Body.challenge: ${body['challenge']}`);
            if (this.signingSecret) {
                const rawBody = request.rawBody || JSON.stringify(body);
                this.logger.debug(`Raw body length: ${rawBody ? rawBody.length : 0}`);
                this.validateSignature(signature, timestamp, rawBody);
            }
            this.logger.log(`Received Slack webhook | type: ${body['type']}`);
            if (body['type'] === 'url_verification') {
                const challenge = body['challenge'];
                this.logger.log(`✓ Slack URL verification challenge | challenge: ${challenge}`);
                return { challenge };
            }
            if (body['type'] === 'event_callback') {
                const event = body['event'];
                const baseEventType = event['type'];
                const eventType = (0, event_type_helper_1.getSlackEventType)(event);
                this.logger.log(`Processing event [${eventType}] (base: ${baseEventType}) | event_id: ${body['event_id']}`);
                this.slackEventRouter.routeEvent(eventType, body).catch((error) => {
                    this.logger.error(`Failed to route event [${eventType}]: ${error instanceof Error ? error.message : String(error)}`);
                });
                return { received: true };
            }
            this.logger.warn(`Unknown Slack event type: ${body['type']}`);
            return { received: false };
        }
        catch (error) {
            this.logger.error(`Webhook error: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    validateSignature(signature, timestamp, rawBody) {
        if (!signature || !timestamp) {
            throw new common_1.BadRequestException('Missing signature or timestamp header');
        }
        const [version, hash] = signature.split('=');
        if (version !== 'v0') {
            throw new common_1.BadRequestException(`Invalid signature version: ${version}`);
        }
        const requestTime = parseInt(timestamp, 10) * 1000;
        const currentTime = Date.now();
        if (currentTime - requestTime > this.REQUEST_TIMEOUT_MS) {
            throw new common_1.BadRequestException('Request timestamp too old (replay attack?)');
        }
        const signedContent = `v0:${timestamp}:${rawBody}`;
        const expectedHash = crypto
            .createHmac('sha256', this.signingSecret)
            .update(signedContent)
            .digest('hex');
        if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash))) {
            throw new common_1.BadRequestException('Invalid signature');
        }
        this.logger.debug('✓ Signature validation passed');
    }
};
exports.SlackWebhookController = SlackWebhookController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], SlackWebhookController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-slack-signature')),
    __param(2, (0, common_1.Headers)('x-slack-request-timestamp')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], SlackWebhookController.prototype, "receiveEvent", null);
exports.SlackWebhookController = SlackWebhookController = SlackWebhookController_1 = __decorate([
    (0, common_1.Controller)('webhooks/slack'),
    __metadata("design:paramtypes", [slack_event_router_service_1.SlackEventRouterService])
], SlackWebhookController);
//# sourceMappingURL=slack.webhook.controller.js.map