-- Gateway Schema Migration

CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'PARTIAL');
CREATE TYPE "IgMessageStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "recipients" TEXT[],
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IgMessage" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "status" "IgMessageStatus" NOT NULL DEFAULT 'PENDING',
    "igMessageId" TEXT,
    "errorReason" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IgMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Message_channel_idx" ON "Message"("channel");
CREATE INDEX "Message_status_idx" ON "Message"("status");
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");
CREATE UNIQUE INDEX "IgMessage_messageId_key" ON "IgMessage"("messageId");
CREATE INDEX "IgMessage_recipient_idx" ON "IgMessage"("recipient");
CREATE INDEX "IgMessage_status_idx" ON "IgMessage"("status");
CREATE INDEX "IgMessage_createdAt_idx" ON "IgMessage"("createdAt");
