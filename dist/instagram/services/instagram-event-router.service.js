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
var InstagramEventRouterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramEventRouterService = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../../rabbitmq/rabbitmq.service");
const events_1 = require("../constants/events");
const queues_1 = require("../../rabbitmq/constants/queues");
let InstagramEventRouterService = InstagramEventRouterService_1 = class InstagramEventRouterService {
    constructor(rabbitmq) {
        this.rabbitmq = rabbitmq;
        this.logger = new common_1.Logger(InstagramEventRouterService_1.name);
        this.eventTypeToRoutingKey = {
            [events_1.InstagramEventType.MESSAGE]: queues_1.ROUTING_KEYS.INSTAGRAM_MESSAGE_RECEIVED,
            [events_1.InstagramEventType.COMMENT]: queues_1.ROUTING_KEYS.INSTAGRAM_COMMENT_RECEIVED,
            [events_1.InstagramEventType.MESSAGE_REACTION]: queues_1.ROUTING_KEYS.INSTAGRAM_REACTION_RECEIVED,
            [events_1.InstagramEventType.MESSAGING_SEEN]: queues_1.ROUTING_KEYS.INSTAGRAM_SEEN_RECEIVED,
            [events_1.InstagramEventType.MESSAGING_REFERRAL]: queues_1.ROUTING_KEYS.INSTAGRAM_REFERRAL_RECEIVED,
            [events_1.InstagramEventType.MESSAGING_OPTINS]: queues_1.ROUTING_KEYS.INSTAGRAM_OPTIN_RECEIVED,
            [events_1.InstagramEventType.MESSAGING_HANDOVER]: queues_1.ROUTING_KEYS.INSTAGRAM_HANDOVER_RECEIVED,
        };
    }
    route(field, value, entryTime) {
        const eventType = events_1.EVENT_TYPE_MAP[field];
        if (!eventType) {
            this.logger.warn(`Unknown Instagram event field: ${field}. Skipping...`);
            return;
        }
        const routingKey = this.eventTypeToRoutingKey[eventType];
        if (!routingKey) {
            this.logger.error(`No routing key configured for event type: ${eventType}`);
            return;
        }
        const payload = {
            eventType,
            entryTime,
            value,
        };
        this.rabbitmq.publish(routingKey, payload);
        this.logger.log(`Routed event [${eventType}] → [${routingKey}]`);
    }
};
exports.InstagramEventRouterService = InstagramEventRouterService;
exports.InstagramEventRouterService = InstagramEventRouterService = InstagramEventRouterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService])
], InstagramEventRouterService);
//# sourceMappingURL=instagram-event-router.service.js.map