"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RequestResponseManager_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestResponseManager = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let RequestResponseManager = RequestResponseManager_1 = class RequestResponseManager {
    constructor() {
        this.logger = new common_1.Logger(RequestResponseManager_1.name);
        this.pendingRequests = new Map();
        this.REQUEST_TIMEOUT = 30000;
    }
    createRequest() {
        const correlationId = (0, uuid_1.v4)();
        const promise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(correlationId);
                reject(new Error(`Request timeout for correlationId ${correlationId}`));
            }, this.REQUEST_TIMEOUT);
            this.pendingRequests.set(correlationId, { resolve, reject, timeout });
        });
        return { correlationId, promise };
    }
    resolveResponse(correlationId, data) {
        const pending = this.pendingRequests.get(correlationId);
        if (!pending) {
            this.logger.warn(`Received response for unknown correlationId: ${correlationId}`);
            return;
        }
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(correlationId);
        pending.resolve(data);
        this.logger.debug(`Response resolved for correlationId: ${correlationId}`);
    }
    rejectResponse(correlationId, error) {
        const pending = this.pendingRequests.get(correlationId);
        if (!pending) {
            this.logger.warn(`Received error for unknown correlationId: ${correlationId}`);
            return;
        }
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(correlationId);
        pending.reject(new Error(error));
        this.logger.debug(`Response rejected for correlationId: ${correlationId}`);
    }
    getPendingCount() {
        return this.pendingRequests.size;
    }
    cleanup() {
        for (const [correlationId, pending] of this.pendingRequests) {
            clearTimeout(pending.timeout);
            pending.reject(new Error('Service is shutting down'));
        }
        this.pendingRequests.clear();
        this.logger.log('RequestResponseManager cleaned up');
    }
};
exports.RequestResponseManager = RequestResponseManager;
exports.RequestResponseManager = RequestResponseManager = RequestResponseManager_1 = __decorate([
    (0, common_1.Injectable)()
], RequestResponseManager);
//# sourceMappingURL=request-response.manager.js.map