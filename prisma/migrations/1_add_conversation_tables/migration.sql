-- Add missing conversation, user, and AI response tables

-- CreateEnum
CREATE TYPE "ConvStatus" AS ENUM ('ACTIVE', 'WAITING_AGENT', 'WITH_AGENT', 'ARCHIVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AIResponseStatus" AS ENUM ('PENDING', 'SENT', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "ChunkStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('USER', 'BOT', 'AGENT', 'SYSTEM');

-- CreateTable User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable UserIdentity
CREATE TABLE "UserIdentity" (
    "id" TEXT NOT NULL,
    "channelUserId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "metadata" JSONB,
    "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable AIResponse
CREATE TABLE "AIResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "originalMessage" TEXT NOT NULL,
    "aiResponse" TEXT NOT NULL,
    "model" TEXT,
    "confidence" DOUBLE PRECISION,
    "processingTime" INTEGER,
    "status" "AIResponseStatus" NOT NULL DEFAULT 'PENDING',
    "sentChunks" INTEGER NOT NULL DEFAULT 0,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable AIResponseChunk
CREATE TABLE "AIResponseChunk" (
    "id" TEXT NOT NULL,
    "aiResponseId" TEXT NOT NULL,
    "chunkNumber" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "externalMessageId" TEXT,
    "channel" TEXT,
    "status" "ChunkStatus" NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIResponseChunk_pkey" PRIMARY KEY ("id")
);

-- Alter Conversation table to add relations and fix unique constraint
ALTER TABLE "Conversation" 
ADD CONSTRAINT "Conversation_channelUserId_channel_key" UNIQUE ("channelUserId", "channel");

-- CreateTable ConversationMessage
CREATE TABLE "ConversationMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "externalId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable ConversationAIResponse
CREATE TABLE "ConversationAIResponse" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userMessage" TEXT NOT NULL,
    "aiResponse" TEXT NOT NULL,
    "model" TEXT,
    "confidence" DOUBLE PRECISION,
    "processingTime" INTEGER,
    "status" "AIResponseStatus" NOT NULL DEFAULT 'PENDING',
    "chunks" INTEGER NOT NULL DEFAULT 0,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationAIResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserIdentity_channel_idx" ON "UserIdentity"("channel");

-- CreateIndex
CREATE INDEX "UserIdentity_trustScore_idx" ON "UserIdentity"("trustScore");

-- CreateIndex
CREATE UNIQUE INDEX "UserIdentity_channelUserId_channel_key" ON "UserIdentity"("channelUserId", "channel");

-- CreateIndex
CREATE INDEX "AIResponse_userId_idx" ON "AIResponse"("userId");

-- CreateIndex
CREATE INDEX "AIResponse_status_idx" ON "AIResponse"("status");

-- CreateIndex
CREATE INDEX "AIResponse_senderId_idx" ON "AIResponse"("senderId");

-- CreateIndex
CREATE INDEX "AIResponse_createdAt_idx" ON "AIResponse"("createdAt");

-- CreateIndex
CREATE INDEX "AIResponseChunk_aiResponseId_idx" ON "AIResponseChunk"("aiResponseId");

-- CreateIndex
CREATE INDEX "AIResponseChunk_status_idx" ON "AIResponseChunk"("status");

-- CreateIndex
CREATE INDEX "ConversationMessage_conversationId_createdAt_idx" ON "ConversationMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "ConversationMessage_sender_idx" ON "ConversationMessage"("sender");

-- CreateIndex
CREATE INDEX "ConversationAIResponse_conversationId_createdAt_idx" ON "ConversationAIResponse"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "ConversationAIResponse_status_idx" ON "ConversationAIResponse"("status");

-- AddForeignKey
ALTER TABLE "UserIdentity" ADD CONSTRAINT "UserIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIResponse" ADD CONSTRAINT "AIResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIResponseChunk" ADD CONSTRAINT "AIResponseChunk_aiResponseId_fkey" FOREIGN KEY ("aiResponseId") REFERENCES "AIResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationAIResponse" ADD CONSTRAINT "ConversationAIResponse_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
