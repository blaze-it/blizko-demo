-- AlterEnum
ALTER TYPE "IntegrationType" ADD VALUE 'YOUTUBE';

-- AlterEnum
ALTER TYPE "NotificationCategory" ADD VALUE 'SECURITY';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'SECURITY_NEW_LOGIN';
ALTER TYPE "NotificationType" ADD VALUE 'SECURITY_PASSWORD_CHANGED';
ALTER TYPE "NotificationType" ADD VALUE 'SECURITY_SESSION_REVOKED';
ALTER TYPE "NotificationType" ADD VALUE 'SECURITY_ALL_SESSIONS_REVOKED';

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "YouTubeSyncState" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLikedVideosSyncAt" TIMESTAMP(3),
    "lastSubscriptionsSyncAt" TIMESTAMP(3),
    "lastPlaylistsSyncAt" TIMESTAMP(3),
    "lastChannelSyncAt" TIMESTAMP(3),
    "lastWatchHistoryImportAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "YouTubeSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YouTubeChannel" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "youtubeChannelId" TEXT NOT NULL,
    "channelTitle" TEXT NOT NULL,
    "channelUrl" TEXT,
    "thumbnailUrl" TEXT,
    "description" TEXT,
    "subscriberCount" INTEGER,
    "videoCount" INTEGER,
    "viewCount" BIGINT,
    "country" TEXT,

    CONSTRAINT "YouTubeChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YouTubeLikedVideo" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "likedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "description" TEXT,
    "durationMs" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "channelTitle" TEXT,
    "channelId" TEXT,
    "channelUrl" TEXT,
    "viewCount" BIGINT,
    "likeCount" BIGINT,
    "commentCount" BIGINT,
    "categoryId" TEXT,
    "tags" TEXT[],

    CONSTRAINT "YouTubeLikedVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YouTubeSubscription" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "subscribedAt" TIMESTAMP(3) NOT NULL,
    "channelId" TEXT NOT NULL,
    "channelTitle" TEXT NOT NULL,
    "channelUrl" TEXT,
    "thumbnailUrl" TEXT,
    "description" TEXT,
    "subscriberCount" BIGINT,
    "videoCount" INTEGER,

    CONSTRAINT "YouTubeSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YouTubePlaylist" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "youtubePlaylistId" TEXT NOT NULL,
    "playlistTitle" TEXT NOT NULL,
    "playlistUrl" TEXT,
    "thumbnailUrl" TEXT,
    "description" TEXT,
    "publishedAt" TIMESTAMP(3),
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "channelId" TEXT,
    "channelTitle" TEXT,

    CONSTRAINT "YouTubePlaylist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YouTubeWatchHistoryEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "channelUrl" TEXT,
    "isEnriched" BOOLEAN NOT NULL DEFAULT false,
    "enrichedAt" TIMESTAMP(3),
    "thumbnailUrl" TEXT,
    "description" TEXT,
    "durationMs" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "channelTitle" TEXT,
    "channelId" TEXT,
    "viewCount" BIGINT,
    "likeCount" BIGINT,
    "commentCount" BIGINT,
    "categoryId" TEXT,
    "tags" TEXT[],
    "takeoutSource" TEXT,

    CONSTRAINT "YouTubeWatchHistoryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YouTubeSettings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "autoSync" BOOLEAN NOT NULL DEFAULT true,
    "autoEnrich" BOOLEAN NOT NULL DEFAULT false,
    "enrichBatchSize" INTEGER NOT NULL DEFAULT 50,
    "userId" TEXT NOT NULL,

    CONSTRAINT "YouTubeSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YouTubeSyncState_userId_key" ON "YouTubeSyncState"("userId");

-- CreateIndex
CREATE INDEX "YouTubeSyncState_userId_idx" ON "YouTubeSyncState"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "YouTubeChannel_userId_key" ON "YouTubeChannel"("userId");

-- CreateIndex
CREATE INDEX "YouTubeChannel_userId_idx" ON "YouTubeChannel"("userId");

-- CreateIndex
CREATE INDEX "YouTubeLikedVideo_userId_idx" ON "YouTubeLikedVideo"("userId");

-- CreateIndex
CREATE INDEX "YouTubeLikedVideo_likedAt_idx" ON "YouTubeLikedVideo"("likedAt");

-- CreateIndex
CREATE INDEX "YouTubeLikedVideo_channelId_idx" ON "YouTubeLikedVideo"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "YouTubeLikedVideo_userId_youtubeVideoId_key" ON "YouTubeLikedVideo"("userId", "youtubeVideoId");

-- CreateIndex
CREATE INDEX "YouTubeSubscription_userId_idx" ON "YouTubeSubscription"("userId");

-- CreateIndex
CREATE INDEX "YouTubeSubscription_channelId_idx" ON "YouTubeSubscription"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "YouTubeSubscription_userId_channelId_key" ON "YouTubeSubscription"("userId", "channelId");

-- CreateIndex
CREATE INDEX "YouTubePlaylist_userId_idx" ON "YouTubePlaylist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "YouTubePlaylist_userId_youtubePlaylistId_key" ON "YouTubePlaylist"("userId", "youtubePlaylistId");

-- CreateIndex
CREATE INDEX "YouTubeWatchHistoryEntry_userId_idx" ON "YouTubeWatchHistoryEntry"("userId");

-- CreateIndex
CREATE INDEX "YouTubeWatchHistoryEntry_watchedAt_idx" ON "YouTubeWatchHistoryEntry"("watchedAt");

-- CreateIndex
CREATE INDEX "YouTubeWatchHistoryEntry_channelId_idx" ON "YouTubeWatchHistoryEntry"("channelId");

-- CreateIndex
CREATE INDEX "YouTubeWatchHistoryEntry_isEnriched_idx" ON "YouTubeWatchHistoryEntry"("isEnriched");

-- CreateIndex
CREATE UNIQUE INDEX "YouTubeWatchHistoryEntry_userId_youtubeVideoId_watchedAt_key" ON "YouTubeWatchHistoryEntry"("userId", "youtubeVideoId", "watchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "YouTubeSettings_userId_key" ON "YouTubeSettings"("userId");

-- CreateIndex
CREATE INDEX "CryptoPrice_cryptoName_createdAt_idx" ON "CryptoPrice"("cryptoName", "createdAt");

-- CreateIndex
CREATE INDEX "CryptoWalletValue_cryptoWalletId_createdAt_idx" ON "CryptoWalletValue"("cryptoWalletId", "createdAt");

-- CreateIndex
CREATE INDEX "GmailMessage_userId_isTrash_isSpam_internalDate_idx" ON "GmailMessage"("userId", "isTrash", "isSpam", "internalDate");

-- CreateIndex
CREATE INDEX "GoogleCalendarEvent_calendarId_status_idx" ON "GoogleCalendarEvent"("calendarId", "status");

-- CreateIndex
CREATE INDEX "GoogleCalendarEvent_isAllDay_idx" ON "GoogleCalendarEvent"("isAllDay");

-- CreateIndex
CREATE INDEX "Invoice_vendorId_issuedOn_idx" ON "Invoice"("vendorId", "issuedOn");

-- CreateIndex
CREATE INDEX "Invoice_vendorId_status_idx" ON "Invoice"("vendorId", "status");

-- CreateIndex
CREATE INDEX "Recording_userId_deletedAt_idx" ON "Recording"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Recording_userId_createdAt_idx" ON "Recording"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "StockFundValue_stockFundName_createdAt_idx" ON "StockFundValue"("stockFundName", "createdAt");

-- CreateIndex
CREATE INDEX "Task_userId_isDeleted_idx" ON "Task"("userId", "isDeleted");

-- CreateIndex
CREATE INDEX "Task_userId_isDeleted_addedAt_idx" ON "Task"("userId", "isDeleted", "addedAt");

-- AddForeignKey
ALTER TABLE "YouTubeSyncState" ADD CONSTRAINT "YouTubeSyncState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouTubeChannel" ADD CONSTRAINT "YouTubeChannel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouTubeLikedVideo" ADD CONSTRAINT "YouTubeLikedVideo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouTubeSubscription" ADD CONSTRAINT "YouTubeSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouTubePlaylist" ADD CONSTRAINT "YouTubePlaylist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouTubeWatchHistoryEntry" ADD CONSTRAINT "YouTubeWatchHistoryEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouTubeSettings" ADD CONSTRAINT "YouTubeSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
