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
var ScrapingMessageInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapingMessageInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../../rabbitmq/rabbitmq.service");
const queues_1 = require("../../rabbitmq/constants/queues");
let ScrapingMessageInterceptor = ScrapingMessageInterceptor_1 = class ScrapingMessageInterceptor {
    constructor(rabbitmq) {
        this.rabbitmq = rabbitmq;
        this.logger = new common_1.Logger(ScrapingMessageInterceptor_1.name);
        this.scrapingKeywords = ['scrappea', 'scrapeá', 'scrappe', 'scraper', 'scrape', 'scrap', 'scrapea'];
    }
    isScrapingRequest(payload) {
        if (!payload || !payload.value || !payload.value.messages || payload.value.messages.length === 0) {
            return false;
        }
        const message = payload.value.messages[0];
        if (!message.text || !message.text.body) {
            return false;
        }
        const text = message.text.body.toLowerCase().trim();
        return this.scrapingKeywords.some((keyword) => text.startsWith(keyword));
    }
    extractScrapingTask(payload) {
        if (!this.isScrapingRequest(payload)) {
            return null;
        }
        const message = payload.value.messages[0];
        const text = message.text.body.trim();
        let taskText = text;
        for (const keyword of this.scrapingKeywords) {
            if (text.toLowerCase().startsWith(keyword)) {
                taskText = text.substring(keyword.length).trim();
                break;
            }
        }
        const urlMatch = taskText.match(/https?:\/\/[^\s]+/);
        if (!urlMatch) {
            this.logger.warn('No URL found in scraping request');
            return null;
        }
        const url = urlMatch[0];
        const params = this.parseScrapingParams(taskText);
        return {
            userId: message.from,
            url,
            type: params.type || 'simple',
            selectors: params.selectors,
            waitFor: params.waitFor,
            credentials: params.credentials,
            searchQuery: params.searchQuery,
            timestamp: Number(message.timestamp),
            originalMessage: text,
        };
    }
    async handleScrapingRequest(payload) {
        const task = this.extractScrapingTask(payload);
        if (!task) {
            this.logger.warn('Failed to extract scraping task from message');
            return;
        }
        this.logger.log(`Publishing scraping task for user ${task.userId}: ${task.url}`);
        try {
            const scrapingMessage = {
                requestId: `${task.userId}-${task.timestamp}`,
                userId: task.userId,
                url: task.url,
                instructions: {
                    type: task.type,
                    action: `Scrape content from ${task.url}`,
                    selectors: this.parseSelectorsFromTask(task),
                    login: this.parseCredentialsFromTask(task),
                    search: task.searchQuery
                        ? {
                            query: task.searchQuery,
                            searchSelector: 'input[type="search"], input[name*="search"], input[placeholder*="search" i]',
                            submitSelector: 'button[type="submit"], button[aria-label*="search" i]',
                            waitTime: 3000,
                        }
                        : undefined,
                    timeout: 30000,
                },
                timestamp: new Date(),
            };
            this.rabbitmq.publish(queues_1.ROUTING_KEYS.SCRAPING_TASK, scrapingMessage);
            this.logger.log(`Scraping task published: ${task.url}`);
        }
        catch (error) {
            this.logger.error(`Failed to publish scraping task: ${error}`);
            throw error;
        }
    }
    parseScrapingParams(text) {
        const params = {};
        const typeMatch = text.match(/tipo:\s*(\w+)/i);
        if (typeMatch) {
            const typeValue = typeMatch[1].toLowerCase();
            if (['simple', 'login', 'search', 'login+search', 'extract'].includes(typeValue)) {
                params.type = typeValue;
            }
        }
        const queryMatch = text.match(/query:\s*([^,\n]+)/i);
        if (queryMatch) {
            params.searchQuery = queryMatch[1].trim();
        }
        const selectorsMatch = text.match(/selectores:\s*([^,\n]+)/i);
        if (selectorsMatch) {
            params.selectors = selectorsMatch[1].split(',').map((s) => s.trim());
        }
        const waitMatch = text.match(/esperar:\s*([^,\n]+)/i);
        if (waitMatch) {
            params.waitFor = waitMatch[1].trim();
        }
        return params;
    }
    parseSelectorsFromTask(task) {
        if (!task.selectors || task.selectors.length === 0) {
            return undefined;
        }
        const selectorsMap = {};
        task.selectors.forEach((selector, index) => {
            selectorsMap[`selector_${index}`] = selector;
        });
        return selectorsMap;
    }
    parseCredentialsFromTask(task) {
        if (!task.credentials || task.type !== 'login') {
            return undefined;
        }
        return {
            username: task.credentials.username || task.credentials.email || '',
            password: task.credentials.password || '',
            usernameSelector: 'input[type="email"], input[name*="user"], input[name*="email"]',
            passwordSelector: 'input[type="password"]',
            submitSelector: 'button[type="submit"], button[aria-label*="login" i]',
            waitForNavigation: true,
        };
    }
};
exports.ScrapingMessageInterceptor = ScrapingMessageInterceptor;
exports.ScrapingMessageInterceptor = ScrapingMessageInterceptor = ScrapingMessageInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService])
], ScrapingMessageInterceptor);
//# sourceMappingURL=scraping-message.interceptor.js.map