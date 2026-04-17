FROM node:20-alpine

RUN apk add --no-cache openssl netcat-openbsd bash

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY entrypoint.sh ./
COPY . .

RUN pnpm prisma:generate
RUN pnpm build

RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "dist/main"]
