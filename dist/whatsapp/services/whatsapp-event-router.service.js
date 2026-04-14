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
var WhatsappEventRouterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappEventRouterService = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../../rabbitmq/rabbitmq.service");
const events_1 = require("../constants/events");
const queues_1 = require("../../rabbitmq/constants/queues");
const scraping_message_interceptor_1 = require("./scraping-message.interceptor");
let WhatsappEventRouterService = WhatsappEventRouterService_1 = class WhatsappEventRouterService {
    constructor(rabbitmq, scrapingInterceptor) {
        this.rabbitmq = rabbitmq;
        this.scrapingInterceptor = scrapingInterceptor;
        this.logger = new common_1.Logger(WhatsappEventRouterService_1.name);
        this.eventTypeToRoutingKey = {
            [events_1.WhatsappEventType.MESSAGE]: queues_1.ROUTING_KEYS.WHATSAPP_MESSAGE_RECEIVED,
            [events_1.WhatsappEventType.MESSAGE_ECHO]: queues_1.ROUTING_KEYS.WHATSAPP_MESSAGE_ECHO_RECEIVED,
            [events_1.WhatsappEventType.CALLS]: queues_1.ROUTING_KEYS.WHATSAPP_CALLS_RECEIVED,
            [events_1.WhatsappEventType.FLOWS]: queues_1.ROUTING_KEYS.WHATSAPP_FLOWS_RECEIVED,
            [events_1.WhatsappEventType.PHONE_NUMBER_UPDATE]: queues_1.ROUTING_KEYS.WHATSAPP_PHONE_NUMBER_UPDATE,
            [events_1.WhatsappEventType.TEMPLATE_UPDATE]: queues_1.ROUTING_KEYS.WHATSAPP_TEMPLATE_UPDATE,
            [events_1.WhatsappEventType.ACCOUNT_ALERTS]: queues_1.ROUTING_KEYS.WHATSAPP_ALERTS_RECEIVED,
        };
    }
    async route(field, value, entryTime) {
        const eventType = events_1.EVENT_TYPE_MAP[field];
        if (!eventType) {
            this.logger.warn(`Unknown WhatsApp event field: ${field}. Skipping...`);
            return;
        }
        const payload = {
            eventType,
            entryTime,
            value,
        };
        if (eventType === events_1.WhatsappEventType.MESSAGE && this.scrapingInterceptor.isScrapingRequest(payload)) {
            this.logger.log('Scraping request detected, redirecting to scraping service');
            try {
                await this.scrapingInterceptor.handleScrapingRequest(payload);
                return;
            }
            catch (error) {
                this.logger.error('Failed to handle scraping request, will process as normal message', error);
            }
        }
        const routingKey = this.eventTypeToRoutingKey[eventType];
        if (!routingKey) {
            this.logger.error(`No routing key configured for event type: ${eventType}`);
            return;
        }
        this.rabbitmq.publish(routingKey, payload);
        this.logger.log(`Routed event [${eventType}] → [${routingKey}]`);
    }
};
exports.WhatsappEventRouterService = WhatsappEventRouterService;
exports.WhatsappEventRouterService = WhatsappEventRouterService = WhatsappEventRouterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService,
        scraping_message_interceptor_1.ScrapingMessageInterceptor])
], WhatsappEventRouterService);
//# sourceMappingURL=whatsapp-event-router.service.js.map