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
var WsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const rabbitmq_service_1 = require("../rabbitmq/rabbitmq.service");
const queues_1 = require("../rabbitmq/constants/queues");
let WsGateway = WsGateway_1 = class WsGateway {
    constructor(rabbitmq) {
        this.rabbitmq = rabbitmq;
        this.logger = new common_1.Logger(WsGateway_1.name);
    }
    async onModuleInit() {
        await this.rabbitmq.subscribe(queues_1.QUEUES.GATEWAY_RESPONSES, queues_1.ROUTING_KEYS.WHATSAPP_RESPONSE, (payload) => this.handleServiceResponse(payload));
        await this.rabbitmq.subscribe(queues_1.QUEUES.GATEWAY_RESPONSES, queues_1.ROUTING_KEYS.NOTION_RESPONSE, (payload) => this.handleServiceResponse(payload));
        await this.rabbitmq.subscribe(queues_1.QUEUES.GATEWAY_RESPONSES, queues_1.ROUTING_KEYS.INSTAGRAM_RESPONSE, (payload) => this.handleServiceResponse(payload));
        await this.rabbitmq.subscribe(queues_1.QUEUES.GATEWAY_RESPONSES, queues_1.ROUTING_KEYS.SLACK_RESPONSE, (payload) => this.handleServiceResponse(payload));
        await this.rabbitmq.subscribe(queues_1.QUEUES.GATEWAY_RESPONSES, queues_1.ROUTING_KEYS.TIKTOK_RESPONSE, (payload) => this.handleServiceResponse(payload));
        await this.rabbitmq.subscribe(queues_1.QUEUES.GATEWAY_RESPONSES, queues_1.ROUTING_KEYS.FACEBOOK_RESPONSE, (payload) => this.handleServiceResponse(payload));
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleSendMessage(payload, client) {
        this.logger.debug(`WS send-message from ${client.id}`);
        return { event: 'message-received', data: { clientId: client.id, ...payload } };
    }
    emitMessageStatus(messageId, status) {
        this.server.emit(`message:${messageId}`, status);
        this.logger.debug(`Emitted status for message ${messageId}`);
    }
    async handleServiceResponse(payload) {
        const { messageId, ...rest } = payload;
        if (!messageId) {
            this.logger.warn('Received response without messageId, ignoring');
            return;
        }
        this.emitMessageStatus(String(messageId), rest);
    }
};
exports.WsGateway = WsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('send-message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], WsGateway.prototype, "handleSendMessage", null);
exports.WsGateway = WsGateway = WsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: '/',
    }),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService])
], WsGateway);
//# sourceMappingURL=ws.gateway.js.map