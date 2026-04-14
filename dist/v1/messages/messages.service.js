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
var MessagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const rabbitmq_service_1 = require("../../rabbitmq/rabbitmq.service");
const queues_1 = require("../../rabbitmq/constants/queues");
const uuid_1 = require("uuid");
const CHANNEL_ROUTING_KEY = {
    whatsapp: queues_1.ROUTING_KEYS.WHATSAPP_SEND,
    instagram: queues_1.ROUTING_KEYS.INSTAGRAM_SEND,
    slack: queues_1.ROUTING_KEYS.SLACK_SEND,
    notion: queues_1.ROUTING_KEYS.NOTION_SEND,
    tiktok: queues_1.ROUTING_KEYS.TIKTOK_SEND,
    facebook: queues_1.ROUTING_KEYS.FACEBOOK_SEND,
};
let MessagesService = MessagesService_1 = class MessagesService {
    constructor(prisma, rabbitmq, config) {
        this.prisma = prisma;
        this.rabbitmq = rabbitmq;
        this.config = config;
        this.logger = new common_1.Logger(MessagesService_1.name);
    }
    async send(dto) {
        const routingKey = CHANNEL_ROUTING_KEY[dto.channel];
        if (!routingKey) {
            throw new common_1.BadRequestException(`Unsupported channel: ${dto.channel}`);
        }
        const message = await this.prisma.message.create({
            data: {
                id: (0, uuid_1.v4)(),
                channel: dto.channel,
                recipients: dto.recipients,
                body: dto.message,
                metadata: (dto.metadata ?? {}),
                status: 'PENDING',
            },
        });
        const payload = {
            messageId: message.id,
            recipients: dto.recipients,
            message: dto.message,
            mediaUrl: dto.mediaUrl ?? null,
            metadata: dto.metadata ?? {},
        };
        if (dto.operation) {
            payload.operation = dto.operation;
        }
        this.rabbitmq.publish(routingKey, payload);
        this.logger.log(`Message ${message.id} queued → channel [${dto.channel}] | recipients: ${dto.recipients.length}`);
        return {
            id: message.id,
            accepted: true,
            channel: message.channel,
            recipients: message.recipients,
            message: message.body,
            status: message.status,
            createdAt: message.createdAt,
        };
    }
    async findOne(id) {
        const message = await this.prisma.message.findUnique({ where: { id } });
        if (!message)
            return null;
        return {
            id: message.id,
            accepted: true,
            channel: message.channel,
            recipients: message.recipients,
            message: message.body,
            status: message.status,
            createdAt: message.createdAt,
        };
    }
    async updateStatus(messageId, status) {
        await this.prisma.message.update({
            where: { id: messageId },
            data: { status: status },
        });
        this.logger.log(`Message ${messageId} status updated → ${status}`);
    }
    async getInstagramConversations() {
        try {
            const instagramServiceUrl = this.config.get('INSTAGRAM_SERVICE_URL') ?? 'http://instagram:3004';
            const response = await fetch(`${instagramServiceUrl}/conversations`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw new Error(`Instagram service returned ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            this.logger.error(`Failed to fetch Instagram conversations: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async sendToInstagramUser(igsid, message, mediaUrl) {
        try {
            const instagramServiceUrl = this.config.get('INSTAGRAM_SERVICE_URL') ?? 'http://instagram:3004';
            const response = await fetch(`${instagramServiceUrl}/send/${igsid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, mediaUrl }),
            });
            if (!response.ok) {
                throw new Error(`Instagram service returned ${response.status}: ${response.statusText}`);
            }
            const result = await response.json();
            this.logger.log(`Message sent to Instagram user ${igsid}: ${result.messageId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to send message to Instagram user ${igsid}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = MessagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rabbitmq_service_1.RabbitMQService,
        config_1.ConfigService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map