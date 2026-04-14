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
var SlackEventRouterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackEventRouterService = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../../rabbitmq/rabbitmq.service");
const events_1 = require("../constants/events");
const queues_1 = require("../../rabbitmq/constants/queues");
let SlackEventRouterService = SlackEventRouterService_1 = class SlackEventRouterService {
    constructor(rabbitmq) {
        this.rabbitmq = rabbitmq;
        this.logger = new common_1.Logger(SlackEventRouterService_1.name);
        this.eventTypeToRoutingKey = {
            [events_1.SLACK_EVENT_TYPES.MESSAGE_CHANNELS]: queues_1.ROUTING_KEYS.SLACK_MESSAGE_CHANNELS,
            [events_1.SLACK_EVENT_TYPES.MESSAGE_GROUPS]: queues_1.ROUTING_KEYS.SLACK_MESSAGE_GROUPS,
            [events_1.SLACK_EVENT_TYPES.MESSAGE_IM]: queues_1.ROUTING_KEYS.SLACK_MESSAGE_IM,
            [events_1.SLACK_EVENT_TYPES.MESSAGE_MPIM]: queues_1.ROUTING_KEYS.SLACK_MESSAGE_MPIM,
            [events_1.SLACK_EVENT_TYPES.APP_MENTION]: queues_1.ROUTING_KEYS.SLACK_APP_MENTION,
            [events_1.SLACK_EVENT_TYPES.CHANNEL_CREATED]: queues_1.ROUTING_KEYS.SLACK_CHANNEL_CREATED,
            [events_1.SLACK_EVENT_TYPES.CHANNEL_DELETED]: queues_1.ROUTING_KEYS.SLACK_CHANNEL_DELETED,
            [events_1.SLACK_EVENT_TYPES.CHANNEL_RENAMED]: queues_1.ROUTING_KEYS.SLACK_CHANNEL_RENAMED,
            [events_1.SLACK_EVENT_TYPES.MEMBER_JOINED_CHANNEL]: queues_1.ROUTING_KEYS.SLACK_MEMBER_JOINED_CHANNEL,
            [events_1.SLACK_EVENT_TYPES.REACTION_ADDED]: queues_1.ROUTING_KEYS.SLACK_REACTION_ADDED,
            [events_1.SLACK_EVENT_TYPES.REACTION_REMOVED]: queues_1.ROUTING_KEYS.SLACK_REACTION_REMOVED,
            [events_1.SLACK_EVENT_TYPES.USER_CHANGE]: queues_1.ROUTING_KEYS.SLACK_USER_CHANGE,
            [events_1.SLACK_EVENT_TYPES.TEAM_JOIN]: queues_1.ROUTING_KEYS.SLACK_TEAM_JOIN,
            [events_1.SLACK_EVENT_TYPES.FILE_CREATED]: queues_1.ROUTING_KEYS.SLACK_FILE_CREATED,
            [events_1.SLACK_EVENT_TYPES.FILE_DELETED]: queues_1.ROUTING_KEYS.SLACK_FILE_DELETED,
        };
    }
    async routeEvent(eventType, payload) {
        try {
            if (!Object.values(events_1.SLACK_EVENT_TYPES).includes(eventType)) {
                this.logger.warn(`Unsupported Slack event type: ${eventType}`);
                return;
            }
            const routingKey = this.eventTypeToRoutingKey[eventType];
            this.rabbitmq.publish(routingKey, {
                eventType,
                timestamp: payload.event_time || new Date().getTime(),
                teamId: payload.team_id,
                eventId: payload.event_id,
                event: payload.event,
                authorizations: payload.authorizations,
                data: payload,
            });
            this.logger.log(`Slack event routed → [${eventType}] | routing_key: ${routingKey}`);
        }
        catch (error) {
            this.logger.error(`Failed to route Slack event [${eventType}]: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
};
exports.SlackEventRouterService = SlackEventRouterService;
exports.SlackEventRouterService = SlackEventRouterService = SlackEventRouterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService])
], SlackEventRouterService);
//# sourceMappingURL=slack-event-router.service.js.map