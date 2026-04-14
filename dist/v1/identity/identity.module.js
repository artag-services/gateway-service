"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityModule = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_module_1 = require("../../rabbitmq/rabbitmq.module");
const request_response_manager_1 = require("../../identity/services/request-response.manager");
const identity_response_listener_1 = require("../../identity/services/identity-response.listener");
const identity_service_1 = require("./identity.service");
const identity_controller_1 = require("./identity.controller");
let IdentityModule = class IdentityModule {
};
exports.IdentityModule = IdentityModule;
exports.IdentityModule = IdentityModule = __decorate([
    (0, common_1.Module)({
        imports: [rabbitmq_module_1.RabbitMQModule],
        providers: [request_response_manager_1.RequestResponseManager, identity_response_listener_1.IdentityResponseListener, identity_service_1.IdentityService],
        controllers: [identity_controller_1.IdentityController],
        exports: [request_response_manager_1.RequestResponseManager],
    })
], IdentityModule);
//# sourceMappingURL=identity.module.js.map