"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramModule = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_module_1 = require("../rabbitmq/rabbitmq.module");
const instagram_event_router_service_1 = require("./services/instagram-event-router.service");
let InstagramModule = class InstagramModule {
};
exports.InstagramModule = InstagramModule;
exports.InstagramModule = InstagramModule = __decorate([
    (0, common_1.Module)({
        imports: [rabbitmq_module_1.RabbitMQModule],
        providers: [instagram_event_router_service_1.InstagramEventRouterService],
        exports: [instagram_event_router_service_1.InstagramEventRouterService],
    })
], InstagramModule);
//# sourceMappingURL=instagram.module.js.map