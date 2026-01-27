-- CreateEnum
CREATE TYPE "BankConnectionStatus" AS ENUM ('CREATED', 'LINKED', 'EXPIRED', 'SUSPENDED', 'REVOKED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "IntegrationType" ADD VALUE 'NOTION';
ALTER TYPE "IntegrationType" ADD VALUE 'GOCARDLESS';
ALTER TYPE "IntegrationType" ADD VALUE 'GITHUB';

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "notionPageId" TEXT,
    "notionUrl" TEXT,
    "coverImageUrl" TEXT,
    "icon" TEXT,
    "tags" TEXT[],
    "originalCreatedAt" TIMESTAMP(3),
    "originalUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotionSyncState" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastImportAt" TIMESTAMP(3),
    "importStatus" TEXT,
    "importProgress" JSONB,
    "lastError" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "NotionSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankConnection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "provider" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "requisitionId" TEXT NOT NULL,
    "agreementId" TEXT,
    "status" "BankConnectionStatus" NOT NULL DEFAULT 'CREATED',
    "consentExpires" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "accountIds" TEXT[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "BankConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubSyncState" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastReposSyncAt" TIMESTAMP(3),
    "lastEventsSyncAt" TIMESTAMP(3),
    "lastNotificationsSyncAt" TIMESTAMP(3),
    "lastEventsEtag" TEXT,
    "lastNotificationsEtag" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "GitHubSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubRepository" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "githubId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "isFork" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "stargazersCount" INTEGER NOT NULL DEFAULT 0,
    "forksCount" INTEGER NOT NULL DEFAULT 0,
    "openIssuesCount" INTEGER NOT NULL DEFAULT 0,
    "watchersCount" INTEGER NOT NULL DEFAULT 0,
    "htmlUrl" TEXT NOT NULL,
    "cloneUrl" TEXT,
    "sshUrl" TEXT,
    "githubCreatedAt" TIMESTAMP(3) NOT NULL,
    "githubUpdatedAt" TIMESTAMP(3) NOT NULL,
    "githubPushedAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "GitHubRepository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "githubEventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actorLogin" TEXT NOT NULL,
    "actorAvatarUrl" TEXT,
    "repoName" TEXT NOT NULL,
    "repoId" INTEGER,
    "payload" JSONB NOT NULL,
    "summary" TEXT,
    "githubCreatedAt" TIMESTAMP(3) NOT NULL,
    "syncedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "GitHubEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubNotification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "githubNotificationId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "unread" BOOLEAN NOT NULL DEFAULT true,
    "subjectTitle" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectUrl" TEXT,
    "repoFullName" TEXT NOT NULL,
    "repoId" INTEGER,
    "githubUpdatedAt" TIMESTAMP(3) NOT NULL,
    "lastReadAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "GitHubNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Note_notionPageId_key" ON "Note"("notionPageId");

-- CreateIndex
CREATE INDEX "Note_userId_idx" ON "Note"("userId");

-- CreateIndex
CREATE INDEX "Note_notionPageId_idx" ON "Note"("notionPageId");

-- CreateIndex
CREATE INDEX "Note_createdAt_idx" ON "Note"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotionSyncState_userId_key" ON "NotionSyncState"("userId");

-- CreateIndex
CREATE INDEX "NotionSyncState_userId_idx" ON "NotionSyncState"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BankConnection_requisitionId_key" ON "BankConnection"("requisitionId");

-- CreateIndex
CREATE INDEX "BankConnection_userId_idx" ON "BankConnection"("userId");

-- CreateIndex
CREATE INDEX "BankConnection_requisitionId_idx" ON "BankConnection"("requisitionId");

-- CreateIndex
CREATE INDEX "BankConnection_status_idx" ON "BankConnection"("status");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubSyncState_userId_key" ON "GitHubSyncState"("userId");

-- CreateIndex
CREATE INDEX "GitHubSyncState_userId_idx" ON "GitHubSyncState"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubRepository_githubId_key" ON "GitHubRepository"("githubId");

-- CreateIndex
CREATE INDEX "GitHubRepository_userId_idx" ON "GitHubRepository"("userId");

-- CreateIndex
CREATE INDEX "GitHubRepository_fullName_idx" ON "GitHubRepository"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubRepository_userId_githubId_key" ON "GitHubRepository"("userId", "githubId");

-- CreateIndex
CREATE INDEX "GitHubEvent_userId_idx" ON "GitHubEvent"("userId");

-- CreateIndex
CREATE INDEX "GitHubEvent_githubCreatedAt_idx" ON "GitHubEvent"("githubCreatedAt");

-- CreateIndex
CREATE INDEX "GitHubEvent_type_idx" ON "GitHubEvent"("type");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubEvent_userId_githubEventId_key" ON "GitHubEvent"("userId", "githubEventId");

-- CreateIndex
CREATE INDEX "GitHubNotification_userId_idx" ON "GitHubNotification"("userId");

-- CreateIndex
CREATE INDEX "GitHubNotification_unread_idx" ON "GitHubNotification"("unread");

-- CreateIndex
CREATE INDEX "GitHubNotification_githubUpdatedAt_idx" ON "GitHubNotification"("githubUpdatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubNotification_userId_githubNotificationId_key" ON "GitHubNotification"("userId", "githubNotificationId");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotionSyncState" ADD CONSTRAINT "NotionSyncState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankConnection" ADD CONSTRAINT "BankConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubSyncState" ADD CONSTRAINT "GitHubSyncState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubRepository" ADD CONSTRAINT "GitHubRepository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubEvent" ADD CONSTRAINT "GitHubEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubNotification" ADD CONSTRAINT "GitHubNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
