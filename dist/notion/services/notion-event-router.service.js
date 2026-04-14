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
var NotionEventRouterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionEventRouterService = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../../rabbitmq/rabbitmq.service");
const events_1 = require("../constants/events");
const queues_1 = require("../../rabbitmq/constants/queues");
let NotionEventRouterService = NotionEventRouterService_1 = class NotionEventRouterService {
    constructor(rabbitmq) {
        this.rabbitmq = rabbitmq;
        this.logger = new common_1.Logger(NotionEventRouterService_1.name);
        this.eventTypeToRoutingKey = {
            [events_1.NotionEventType.PAGE_CREATED]: queues_1.ROUTING_KEYS.NOTION_PAGE_CREATED,
            [events_1.NotionEventType.PAGE_CONTENT_UPDATED]: queues_1.ROUTING_KEYS.NOTION_PAGE_CONTENT_UPDATED,
            [events_1.NotionEventType.PAGE_PROPERTIES_UPDATED]: queues_1.ROUTING_KEYS.NOTION_PAGE_PROPERTIES_UPDATED,
            [events_1.NotionEventType.PAGE_MOVED]: queues_1.ROUTING_KEYS.NOTION_PAGE_MOVED,
            [events_1.NotionEventType.PAGE_DELETED]: queues_1.ROUTING_KEYS.NOTION_PAGE_DELETED,
            [events_1.NotionEventType.PAGE_UNDELETED]: queues_1.ROUTING_KEYS.NOTION_PAGE_UNDELETED,
            [events_1.NotionEventType.PAGE_LOCKED]: queues_1.ROUTING_KEYS.NOTION_PAGE_LOCKED,
            [events_1.NotionEventType.PAGE_UNLOCKED]: queues_1.ROUTING_KEYS.NOTION_PAGE_UNLOCKED,
            [events_1.NotionEventType.DATABASE_CREATED]: queues_1.ROUTING_KEYS.NOTION_DATABASE_CREATED,
            [events_1.NotionEventType.DATA_SOURCE_CREATED]: queues_1.ROUTING_KEYS.NOTION_DATA_SOURCE_CREATED,
            [events_1.NotionEventType.DATA_SOURCE_CONTENT_UPDATED]: queues_1.ROUTING_KEYS.NOTION_DATA_SOURCE_CONTENT_UPDATED,
            [events_1.NotionEventType.DATA_SOURCE_MOVED]: queues_1.ROUTING_KEYS.NOTION_DATA_SOURCE_MOVED,
            [events_1.NotionEventType.DATA_SOURCE_DELETED]: queues_1.ROUTING_KEYS.NOTION_DATA_SOURCE_DELETED,
            [events_1.NotionEventType.DATA_SOURCE_UNDELETED]: queues_1.ROUTING_KEYS.NOTION_DATA_SOURCE_UNDELETED,
            [events_1.NotionEventType.DATA_SOURCE_SCHEMA_UPDATED]: queues_1.ROUTING_KEYS.NOTION_DATA_SOURCE_SCHEMA_UPDATED,
            [events_1.NotionEventType.COMMENT_CREATED]: queues_1.ROUTING_KEYS.NOTION_COMMENT_CREATED,
            [events_1.NotionEventType.COMMENT_UPDATED]: queues_1.ROUTING_KEYS.NOTION_COMMENT_UPDATED,
            [events_1.NotionEventType.COMMENT_DELETED]: queues_1.ROUTING_KEYS.NOTION_COMMENT_DELETED,
        };
    }
    route(eventType, payload) {
        const type = events_1.EVENT_TYPE_MAP[eventType];
        if (!type) {
            this.logger.warn(`Unknown Notion event type: ${eventType}. Skipping...`);
            return;
        }
        const routingKey = this.eventTypeToRoutingKey[type];
        if (!routingKey) {
            this.logger.error(`No routing key configured for event type: ${type}`);
            return;
        }
        this.rabbitmq.publish(routingKey, payload);
        this.logger.log(`Routed event [${type}] → [${routingKey}]`);
    }
};
exports.NotionEventRouterService = NotionEventRouterService;
exports.NotionEventRouterService = NotionEventRouterService = NotionEventRouterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService])
], NotionEventRouterService);
//# sourceMappingURL=notion-event-router.service.js.map