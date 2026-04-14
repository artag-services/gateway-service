"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const express = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.use((req, res, next) => {
        express.text({ limit: '10mb', type: '*/*' })(req, res, () => {
            const rawBody = req.body || '';
            req.rawBody = rawBody;
            try {
                req.body = rawBody ? JSON.parse(rawBody) : {};
            }
            catch (e) {
                req.body = {};
            }
            next();
        });
    });
    app.use(express.urlencoded({ limit: '10mb', extended: true }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    app.use((req, res, next) => {
        const method = req.method;
        const path = req.path;
        const url = req.url;
        const timestamp = new Date().toISOString();
        console.log(`\n╔════════════════════════════════════════════════════════════╗`);
        console.log(`║ 🌐 INCOMING REQUEST - ${timestamp}`);
        console.log(`╠════════════════════════════════════════════════════════════╣`);
        console.log(`║ Method: ${method}`);
        console.log(`║ Path: ${path}`);
        console.log(`║ Full URL: ${url}`);
        console.log(`║ Headers: ${JSON.stringify(req.headers, null, 2)}`);
        if (method === 'POST' || method === 'PUT') {
            console.log(`║ Body: ${JSON.stringify(req.body, null, 2)}`);
            const rawBody = req.rawBody;
            if (rawBody && typeof rawBody === 'string') {
                console.log(`║ Raw Body (first 100 chars): ${rawBody.substring(0, 100)}`);
            }
        }
        console.log(`╚════════════════════════════════════════════════════════════╝\n`);
        next();
    });
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`Gateway running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map