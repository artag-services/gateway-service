"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const rabbitmq_module_1 = require("./rabbitmq/rabbitmq.module");
const ws_module_1 = require("./websocket/ws.module");
const messages_module_1 = require("./v1/messages/messages.module");
const identity_module_1 = require("./v1/identity/identity.module");
const scraping_module_1 = require("./v1/scraping/scraping.module");
const webhook_module_1 = require("./webhooks/webhook.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            prisma_module_1.PrismaModule,
            rabbitmq_module_1.RabbitMQModule,
            ws_module_1.WebsocketModule,
            messages_module_1.MessagesModule,
            identity_module_1.IdentityModule,
            scraping_module_1.ScrapingModule,
            webhook_module_1.WebhookModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map