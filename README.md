# Gateway Service

> Único punto de entrada HTTP del sistema. Orquesta todos los microservicios vía RabbitMQ.

## Qué hace

El **gateway** es el "router" central del proyecto. Todos los clientes externos (frontends, webhooks de providers, integraciones) hablan con este servicio — nunca con los microservicios directamente. Cuando llega una request:

1. La valida (DTOs con `class-validator`)
2. La publica en RabbitMQ al routing key correcto
3. Si necesita respuesta, espera el response vía correlationId
4. Devuelve al cliente

También expone **SSE** para notificaciones push (cuando termina un scraping, llega un email, etc.) y un controller dedicado por cada provider que manda webhooks (Resend, Meta, Slack, Notion).

## Stack

| Pieza | Valor |
|---|---|
| Framework | NestJS 10 |
| Lenguaje | TypeScript 5 |
| DB | PostgreSQL (`gateway_db`) — solo metadata de conversations + tracking de mensajes |
| Mensajería | RabbitMQ (exchange topic `channels`) — backbone del sistema |
| WebSocket | `@nestjs/websockets` + Socket.IO (legacy, en uso para algunos features) |
| Streaming | Server-Sent Events nativo en `/api/v1/events` |
| Puerto | `3000` |

## Su rol en la arquitectura

```
                    ┌─────────────┐
                    │  Frontend   │
                    └──────┬──────┘
                           │ HTTPS
                           ▼
   ┌──────────────────────────────────────────────┐
   │  GATEWAY (este servicio)                     │
   │                                              │
   │  ├─ HTTP controllers (v1/* + webhooks/*)    │
   │  ├─ DTOs + validation                        │
   │  ├─ RPC client (RequestResponseManager)      │
   │  ├─ SSE bus (events.service.ts)             │
   │  └─ Webhook receivers (verifica firmas)      │
   └──────────────┬───────────────────────────────┘
                  │ publish + consume
                  ▼
            ┌──────────────┐
            │   RabbitMQ   │  ← exchange "channels"
            └──────┬───────┘
                   │
        ┌──────────┼──────────┬──────────┐
        ▼          ▼          ▼          ▼
    whatsapp    email     notion    scheduler ...
```

## Funcionalidades principales

### 1. HTTP API pública (en `/api/v1/*`)
Endpoints organizados por dominio: messages, emails, schedules, agent, scraping, identity, conversations. Documentados en [docs/api/](../docs/api/).

### 2. Webhook receivers (en `/api/webhooks/*`)
Único endpoint público para providers externos:
- `POST /api/webhooks/whatsapp` — Meta WhatsApp Cloud API
- `POST /api/webhooks/instagram` — Meta Instagram Graph API
- `POST /api/webhooks/slack` — Slack Events API
- `POST /api/webhooks/notion` — Notion webhooks (18 tipos)
- `POST /api/webhooks/resend` — Resend (delivery tracking, multi-account)
- `POST /api/webhooks/email/inbound` — Cloudflare Email Routing → emails entrantes

Cada uno valida firma HMAC del provider antes de publicar a RabbitMQ.

### 3. SSE bus (`GET /api/v1/events?topics=...`)
Stream Server-Sent Events. Suscribite por topic (`scraping:<jobId>`, `email:*`, `agent:*`, etc.) y recibís push real-time cuando ocurre algo en los microservicios.

### 4. Patrones de mensajería
- **Fire-and-forget** — `202 Accepted` → publica al broker y vuelve
- **RPC** — `200 OK` → espera respuesta del microservicio destino vía correlationId
- **Broadcast** — un microservicio publica un evento, N consumidores lo reciben

## Configuración (`.env`)

```env
GATEWAY_PORT=3000
GATEWAY_DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/gateway_db
RABBITMQ_URL=amqp://admin:password@rabbitmq:5672
RABBITMQ_EXCHANGE=channels

# Tokens y secrets de webhook validation (uno por provider)
RESEND_WEBHOOK_SECRETS=whsec_xxx,whsec_yyy        # multi-cuenta
INBOUND_EMAIL_WEBHOOK_SECRET=...                  # HMAC para Cloudflare workers
SLACK_SIGNING_SECRET=...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=...
NOTION_WEBHOOK_VERIFICATION_TOKEN=...
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=...
FACEBOOK_WEBHOOK_VERIFY_TOKEN=...
```

## Cómo correrlo

**Vía Docker Compose desde la raíz del repo (recomendado):**
```bash
docker-compose up -d gateway
```

**Dev local con watch mode:**
```bash
cd gateway
pnpm install
pnpm prisma:generate
pnpm start:dev
```

## Estructura

```
gateway/
├── src/
│   ├── main.ts                       # bootstrap + middleware (rawBody capture)
│   ├── app.module.ts                 # registra todos los módulos v1
│   ├── prisma/                       # Prisma client global
│   ├── rabbitmq/                     # cliente RabbitMQ + constantes de queues
│   ├── v1/
│   │   ├── identity/                 # /v1/identity/*
│   │   ├── messages/                 # /v1/messages/*
│   │   ├── conversations/            # /v1/conversations/*
│   │   ├── scraping/                 # /v1/scraping/*
│   │   ├── email/                    # /v1/emails/*
│   │   ├── scheduler/                # /v1/schedules/*
│   │   └── agent/                    # /v1/agent/*
│   ├── webhooks/                     # /api/webhooks/<provider>/*
│   ├── events/                       # SSE bus
│   ├── identity/services/            # RequestResponseManager (RPC promise tracker)
│   └── common/                       # filters, interceptors
└── prisma/schema.prisma              # Conversation, Message
```

## Ver también

- **[../docs/api/](../docs/api/)** — referencia completa del API para frontend
- **[../docs/api/events.md](../docs/api/events.md)** — SSE bus (cómo suscribirse)
- **[../AGENTS.md](../AGENTS.md)** — deep dive de flujos
- **[../.claude/skills/microservice-pattern/SKILL.md](../.claude/skills/microservice-pattern/SKILL.md)** — patrón de arquitectura

## ⚠️ Reglas duras

1. **Solo el gateway recibe HTTP/webhooks de afuera.** Ningún microservicio debe exponer puerto público.
2. **Toda comunicación gateway ↔ microservicios va por RabbitMQ.** Nada de HTTP directo.
3. **DTOs estrictos** (`whitelist: true, forbidNonWhitelisted: true`) — campos extra causan 400.
