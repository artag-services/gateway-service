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
var ScrapingResponseListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapingResponseListener = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../../../rabbitmq/rabbitmq.service");
const messages_service_1 = require("../../messages/messages.service");
const queues_1 = require("../../../rabbitmq/constants/queues");
const config_1 = require("@nestjs/config");
let ScrapingResponseListener = ScrapingResponseListener_1 = class ScrapingResponseListener {
    constructor(rabbitmq, messagesService, configService) {
        this.rabbitmq = rabbitmq;
        this.messagesService = messagesService;
        this.configService = configService;
        this.logger = new common_1.Logger(ScrapingResponseListener_1.name);
        this.personalWhatsappNumber = this.configService.get('PERSONAL_WHATSAPP_NUMBER', '573205711428');
        this.logger.log(`ScrapingResponseListener initialized`);
        this.logger.log(`   - Will send notifications to: ${this.personalWhatsappNumber}`);
    }
    async onModuleInit() {
        try {
            this.logger.log('🚀 ScrapingResponseListener initializing...');
            await this.rabbitmq.subscribe(queues_1.QUEUES.SCRAPPING_NOTION_RESPONSE, queues_1.ROUTING_KEYS.SCRAPPING_NOTION_RESPONSE, (payload) => this.handleNotionResponse(payload));
            this.logger.log(`✅ Subscribed to ${queues_1.QUEUES.SCRAPPING_NOTION_RESPONSE} queue`);
            this.logger.log('✅ ScrapingResponseListener initialized successfully - Waiting for Notion responses...');
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            this.logger.error(`❌ Failed to initialize ScrapingResponseListener: ${msg}`);
            throw error;
        }
    }
    async handleNotionResponse(payload) {
        try {
            this.logger.log(`📨 Received Notion response | messageId=${payload.messageId}, status=${payload.status}`);
            if (payload.status === 'SUCCESS') {
                const { notionPageUrl, messageId, userId } = payload;
                const notionMessage = `
✅ *Tu scraping está en Notion*

📄 La página fue creada exitosamente
🔗 Ver en Notion: ${notionPageUrl}

⏰ ${new Date().toLocaleString('es-CO')}
        `.trim();
                const targetNumber = userId || this.personalWhatsappNumber;
                this.logger.log(`📱 STEP 1: Sending Notion success notification`);
                this.logger.log(`   - targetNumber: ${targetNumber}`);
                this.logger.log(`   - messageId: ${messageId}`);
                this.logger.log(`   - notionPageUrl: ${notionPageUrl}`);
                try {
                    const sendResult = await this.messagesService.send({
                        channel: 'whatsapp',
                        recipients: [targetNumber],
                        message: notionMessage,
                        metadata: {
                            messageId,
                            type: 'notion_page_created',
                        },
                    });
                    this.logger.log(`✅ WhatsApp notification sent successfully | messageId=${messageId}`);
                    this.logger.log(`   - result.id: ${sendResult.id}`);
                    this.logger.log(`   - result.status: ${sendResult.status}`);
                }
                catch (wpError) {
                    const err = wpError instanceof Error ? wpError.message : String(wpError);
                    this.logger.error(`❌ Failed to send WhatsApp notification: ${err}`);
                    this.logger.error(`   - targetNumber: ${targetNumber}`);
                    this.logger.error(`   - messageId: ${messageId}`);
                    throw wpError;
                }
            }
            else {
                this.logger.warn(`⚠️ Notion operation failed | messageId=${payload.messageId}, error=${payload.error}`);
            }
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            this.logger.error(`❌ Error processing Notion response: ${msg}`);
            throw error;
        }
    }
};
exports.ScrapingResponseListener = ScrapingResponseListener;
exports.ScrapingResponseListener = ScrapingResponseListener = ScrapingResponseListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService,
        messages_service_1.MessagesService,
        config_1.ConfigService])
], ScrapingResponseListener);
//# sourceMappingURL=scraping-response.listener.js.map