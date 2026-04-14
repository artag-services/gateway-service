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
var IdentityResponseListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityResponseListener = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../../rabbitmq/rabbitmq.service");
const request_response_manager_1 = require("./request-response.manager");
const queues_1 = require("../../rabbitmq/constants/queues");
let IdentityResponseListener = IdentityResponseListener_1 = class IdentityResponseListener {
    constructor(rabbitmq, requestResponseManager) {
        this.rabbitmq = rabbitmq;
        this.requestResponseManager = requestResponseManager;
        this.logger = new common_1.Logger(IdentityResponseListener_1.name);
    }
    async onModuleInit() {
        try {
            await this.rabbitmq.subscribe(queues_1.QUEUES.IDENTITY_RESPONSES, queues_1.ROUTING_KEYS.IDENTITY_RESPONSE, (message) => this.handleResponse(message));
            this.logger.log('Identity response listener started');
        }
        catch (error) {
            this.logger.error(`Failed to start response listener: ${error.message}`);
            throw error;
        }
    }
    async handleResponse(message) {
        try {
            const { correlationId, success, error } = message;
            if (!correlationId) {
                this.logger.warn('Received response without correlationId');
                return;
            }
            this.logger.debug(`Received response for correlationId: ${correlationId}, success: ${success}`);
            if (success) {
                const { correlationId: _, ...data } = message;
                this.requestResponseManager.resolveResponse(correlationId, data);
            }
            else {
                this.requestResponseManager.rejectResponse(correlationId, error || 'Unknown error from identity-service');
            }
        }
        catch (error) {
            this.logger.error(`Error handling response: ${error.message}`, error instanceof Error ? error.stack : '');
        }
    }
    onModuleDestroy() {
        this.requestResponseManager.cleanup();
    }
};
exports.IdentityResponseListener = IdentityResponseListener;
exports.IdentityResponseListener = IdentityResponseListener = IdentityResponseListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService,
        request_response_manager_1.RequestResponseManager])
], IdentityResponseListener);
//# sourceMappingURL=identity-response.listener.js.map