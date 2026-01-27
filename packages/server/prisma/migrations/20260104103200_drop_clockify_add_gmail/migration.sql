-- Drop Clockify tables (data already migrated to TimeEntry)
DROP TABLE IF EXISTS "ClockifyTimeEntry";
DROP TABLE IF EXISTS "ClockifyProject";
DROP TABLE IF EXISTS "ClockifyClient";
DROP TABLE IF EXISTS "ClockifyWorkspace";
DROP TABLE IF EXISTS "ClockifySyncState";

-- Add GMAIL to IntegrationType enum
ALTER TYPE "IntegrationType" ADD VALUE 'GMAIL';

-- CreateTable
CREATE TABLE "GmailSyncState" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "historyId" TEXT,
    "nextPageToken" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "GmailSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GmailMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gmailId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "subject" TEXT,
    "snippet" TEXT,
    "fromEmail" TEXT,
    "fromName" TEXT,
    "toEmails" TEXT[],
    "ccEmails" TEXT[],
    "bodyText" TEXT,
    "bodyHtml" TEXT,
    "internalDate" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "labelIds" TEXT[],
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isTrash" BOOLEAN NOT NULL DEFAULT false,
    "hasAttachments" BOOLEAN NOT NULL DEFAULT false,
    "sizeEstimate" INTEGER,
    "syncedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "GmailMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GmailSyncState_userId_key" ON "GmailSyncState"("userId");

-- CreateIndex
CREATE INDEX "GmailSyncState_userId_idx" ON "GmailSyncState"("userId");

-- CreateIndex
CREATE INDEX "GmailMessage_userId_idx" ON "GmailMessage"("userId");

-- CreateIndex
CREATE INDEX "GmailMessage_gmailId_idx" ON "GmailMessage"("gmailId");

-- CreateIndex
CREATE INDEX "GmailMessage_threadId_idx" ON "GmailMessage"("threadId");

-- CreateIndex
CREATE INDEX "GmailMessage_receivedAt_idx" ON "GmailMessage"("receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GmailMessage_userId_gmailId_key" ON "GmailMessage"("userId", "gmailId");

-- AddForeignKey
ALTER TABLE "GmailSyncState" ADD CONSTRAINT "GmailSyncState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GmailMessage" ADD CONSTRAINT "GmailMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
