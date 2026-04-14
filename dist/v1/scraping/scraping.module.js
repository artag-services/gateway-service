"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapingModule = void 0;
const common_1 = require("@nestjs/common");
const scraping_controller_1 = require("./scraping.controller");
const scraping_service_1 = require("./scraping.service");
const rabbitmq_module_1 = require("../../rabbitmq/rabbitmq.module");
const messages_module_1 = require("../messages/messages.module");
const scraping_response_listener_1 = require("./services/scraping-response.listener");
let ScrapingModule = class ScrapingModule {
};
exports.ScrapingModule = ScrapingModule;
exports.ScrapingModule = ScrapingModule = __decorate([
    (0, common_1.Module)({
        imports: [rabbitmq_module_1.RabbitMQModule, messages_module_1.MessagesModule],
        controllers: [scraping_controller_1.ScrapingController],
        providers: [scraping_service_1.ScrapingService, scraping_response_listener_1.ScrapingResponseListener],
        exports: [scraping_service_1.ScrapingService],
    })
], ScrapingModule);
//# sourceMappingURL=scraping.module.js.map