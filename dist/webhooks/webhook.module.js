"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookModule = void 0;
const common_1 = require("@nestjs/common");
const instagram_webhook_controller_1 = require("./instagram.webhook.controller");
const whatsapp_webhook_controller_1 = require("./whatsapp.webhook.controller");
const notion_webhook_controller_1 = require("./notion.webhook.controller");
const slack_webhook_controller_1 = require("./slack.webhook.controller");
const instagram_module_1 = require("../instagram/instagram.module");
const whatsapp_module_1 = require("../whatsapp/whatsapp.module");
const notion_module_1 = require("../notion/notion.module");
const slack_module_1 = require("../slack/slack.module");
let WebhookModule = class WebhookModule {
};
exports.WebhookModule = WebhookModule;
exports.WebhookModule = WebhookModule = __decorate([
    (0, common_1.Module)({
        imports: [instagram_module_1.InstagramModule, whatsapp_module_1.WhatsappModule, notion_module_1.NotionModule, slack_module_1.SlackModule],
        controllers: [
            instagram_webhook_controller_1.InstagramWebhookController,
            whatsapp_webhook_controller_1.WhatsappWebhookController,
            notion_webhook_controller_1.NotionWebhookController,
            slack_webhook_controller_1.SlackWebhookController,
        ],
    })
], WebhookModule);
//# sourceMappingURL=webhook.module.js.map