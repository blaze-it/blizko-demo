-- CreateEnum
CREATE TYPE "FactExtractionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "FactVerificationStatus" AS ENUM ('PENDING', 'PROCESSING', 'VERIFIED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ApplePhotosBackupStatus" AS ENUM ('IDLE', 'RUNNING', 'PAUSED', 'ERROR');

-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('WANT_TO_READ', 'READING', 'COMPLETED', 'DID_NOT_FINISH', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "BookFormat" AS ENUM ('PHYSICAL', 'EBOOK', 'AUDIOBOOK');

-- CreateEnum
CREATE TYPE "WishlistPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "WishlistStatus" AS ENUM ('WANTED', 'CONSIDERING', 'PURCHASED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContactInteractionType" AS ENUM ('CALL', 'EMAIL', 'MESSAGE', 'MEETING', 'SOCIAL_MEDIA', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "IntegrationType" ADD VALUE 'GOOGLE_AI';
ALTER TYPE "IntegrationType" ADD VALUE 'SPOTIFY';

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- AlterTable
ALTER TABLE "MemoryFact" ADD COLUMN     "verificationConfidence" TEXT,
ADD COLUMN     "verificationExplanation" TEXT,
ADD COLUMN     "verificationSources" JSONB,
ADD COLUMN     "verificationStatus" "FactVerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "verificationVerdict" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Recording" ADD COLUMN     "factExtractionError" TEXT,
ADD COLUMN     "factExtractionStatus" "FactExtractionStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "StepEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "steps" INTEGER NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "distance" INTEGER,
    "calories" INTEGER,
    "activeTime" INTEGER,
    "source" TEXT,
    "notes" TEXT,

    CONSTRAINT "StepEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepSettings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyGoal" INTEGER NOT NULL DEFAULT 10000,

    CONSTRAINT "StepSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplePhotosBackupSyncState" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "ApplePhotosBackupStatus" NOT NULL DEFAULT 'IDLE',
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "totalPhotos" INTEGER NOT NULL DEFAULT 0,
    "backedUpPhotos" INTEGER NOT NULL DEFAULT 0,
    "failedPhotos" INTEGER NOT NULL DEFAULT 0,
    "nextcloudPath" TEXT NOT NULL DEFAULT '/Photos/Apple Photos Backup',
    "includeVideos" BOOLEAN NOT NULL DEFAULT true,
    "includeShared" BOOLEAN NOT NULL DEFAULT false,
    "preserveAlbums" BOOLEAN NOT NULL DEFAULT true,
    "skipDuplicates" BOOLEAN NOT NULL DEFAULT true,
    "agentLastSeenAt" TIMESTAMP(3),
    "agentVersion" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ApplePhotosBackupSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplePhotosBackupItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "applePhotoId" TEXT NOT NULL,
    "applePhotoUUID" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "photoCreatedAt" TIMESTAMP(3) NOT NULL,
    "photoModifiedAt" TIMESTAMP(3),
    "albumName" TEXT,
    "albumPath" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "isBackedUp" BOOLEAN NOT NULL DEFAULT false,
    "backedUpAt" TIMESTAMP(3),
    "nextcloudPath" TEXT,
    "nextcloudFileId" TEXT,
    "lastError" TEXT,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "checksum" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ApplePhotosBackupItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isbn" TEXT,
    "coverUrl" TEXT,
    "description" TEXT,
    "publisher" TEXT,
    "publishedDate" TIMESTAMP(3),
    "pageCount" INTEGER,
    "genre" TEXT,
    "tags" TEXT[],
    "status" "BookStatus" NOT NULL DEFAULT 'WANT_TO_READ',
    "format" "BookFormat" NOT NULL DEFAULT 'PHYSICAL',
    "currentPage" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "rating" INTEGER,
    "review" TEXT,
    "goodreadsId" TEXT,
    "goodreadsRating" DOUBLE PRECISION,
    "goodreadsUrl" TEXT,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookNote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "pageNumber" INTEGER,
    "chapter" TEXT,

    CONSTRAINT "BookNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookHighlight" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "note" TEXT,
    "pageNumber" INTEGER,
    "location" TEXT,
    "chapter" TEXT,
    "color" TEXT,

    CONSTRAINT "BookHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "startPage" INTEGER NOT NULL,
    "endPage" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "notes" TEXT,

    CONSTRAINT "ReadingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audiobook" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "author" TEXT,
    "narrator" TEXT,
    "description" TEXT,
    "tags" TEXT[],
    "audioBlob" BYTEA NOT NULL,
    "audioContentType" TEXT NOT NULL DEFAULT 'audio/mp4',
    "audioFileName" TEXT NOT NULL,
    "audioFileSize" BIGINT NOT NULL,
    "coverBlob" BYTEA,
    "coverContentType" TEXT,
    "coverFileName" TEXT,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "progressSeconds" INTEGER NOT NULL DEFAULT 0,
    "playbackSpeed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "lastPlayedAt" TIMESTAMP(3),
    "chapters" JSONB,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Audiobook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "imageUrl" TEXT,
    "targetPrice" DECIMAL(12,2),
    "currentPrice" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "priority" "WishlistPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "WishlistStatus" NOT NULL DEFAULT 'WANTED',
    "category" TEXT,
    "tags" TEXT[],
    "purchasedAt" TIMESTAMP(3),
    "purchasedPrice" DECIMAL(12,2),
    "notes" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishlistPriceHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "source" TEXT,
    "wishlistItemId" TEXT NOT NULL,

    CONSTRAINT "WishlistPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "nickname" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "notes" TEXT,
    "birthday" TIMESTAMP(3),
    "anniversary" TIMESTAMP(3),
    "linkedIn" TEXT,
    "twitter" TEXT,
    "instagram" TEXT,
    "website" TEXT,
    "howWeMet" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "lastContactedAt" TIMESTAMP(3),
    "contactFrequency" INTEGER,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInteraction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "type" "ContactInteractionType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT,
    "notes" TEXT,
    "duration" INTEGER,

    CONSTRAINT "ContactInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactReminder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ContactReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotifySyncState" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastRecentlyPlayedSyncAt" TIMESTAMP(3),
    "lastTopTracksSyncAt" TIMESTAMP(3),
    "lastTopArtistsSyncAt" TIMESTAMP(3),
    "lastPlaylistsSyncAt" TIMESTAMP(3),
    "lastProfileSyncAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "SpotifySyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotifyProfile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "spotifyUserId" TEXT NOT NULL,
    "displayName" TEXT,
    "email" TEXT,
    "country" TEXT,
    "product" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "SpotifyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotifyRecentlyPlayed" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "spotifyTrackId" TEXT NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "trackName" TEXT NOT NULL,
    "trackUrl" TEXT,
    "durationMs" INTEGER NOT NULL,
    "previewUrl" TEXT,
    "artistName" TEXT NOT NULL,
    "artistId" TEXT,
    "artistUrl" TEXT,
    "albumName" TEXT NOT NULL,
    "albumId" TEXT,
    "albumUrl" TEXT,
    "albumImageUrl" TEXT,
    "contextType" TEXT,
    "contextUri" TEXT,

    CONSTRAINT "SpotifyRecentlyPlayed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotifyTopTrack" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "spotifyTrackId" TEXT NOT NULL,
    "timeRange" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "trackName" TEXT NOT NULL,
    "trackUrl" TEXT,
    "durationMs" INTEGER NOT NULL,
    "popularity" INTEGER,
    "artistName" TEXT NOT NULL,
    "artistId" TEXT,
    "artistUrl" TEXT,
    "albumName" TEXT NOT NULL,
    "albumId" TEXT,
    "albumUrl" TEXT,
    "albumImageUrl" TEXT,

    CONSTRAINT "SpotifyTopTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotifyTopArtist" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "spotifyArtistId" TEXT NOT NULL,
    "timeRange" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "artistName" TEXT NOT NULL,
    "artistUrl" TEXT,
    "imageUrl" TEXT,
    "popularity" INTEGER,
    "followers" INTEGER,
    "genres" TEXT[],

    CONSTRAINT "SpotifyTopArtist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotifyPlaylist" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "spotifyPlaylistId" TEXT NOT NULL,
    "playlistName" TEXT NOT NULL,
    "playlistUrl" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isCollaborative" BOOLEAN NOT NULL DEFAULT false,
    "totalTracks" INTEGER NOT NULL DEFAULT 0,
    "snapshotId" TEXT,
    "ownerName" TEXT,
    "ownerId" TEXT,
    "isOwnedByUser" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SpotifyPlaylist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StepEntry_userId_idx" ON "StepEntry"("userId");

-- CreateIndex
CREATE INDEX "StepEntry_entryDate_idx" ON "StepEntry"("entryDate");

-- CreateIndex
CREATE UNIQUE INDEX "StepEntry_userId_entryDate_key" ON "StepEntry"("userId", "entryDate");

-- CreateIndex
CREATE UNIQUE INDEX "StepSettings_userId_key" ON "StepSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplePhotosBackupSyncState_userId_key" ON "ApplePhotosBackupSyncState"("userId");

-- CreateIndex
CREATE INDEX "ApplePhotosBackupSyncState_userId_idx" ON "ApplePhotosBackupSyncState"("userId");

-- CreateIndex
CREATE INDEX "ApplePhotosBackupSyncState_status_idx" ON "ApplePhotosBackupSyncState"("status");

-- CreateIndex
CREATE INDEX "ApplePhotosBackupItem_userId_idx" ON "ApplePhotosBackupItem"("userId");

-- CreateIndex
CREATE INDEX "ApplePhotosBackupItem_isBackedUp_idx" ON "ApplePhotosBackupItem"("isBackedUp");

-- CreateIndex
CREATE INDEX "ApplePhotosBackupItem_photoCreatedAt_idx" ON "ApplePhotosBackupItem"("photoCreatedAt");

-- CreateIndex
CREATE INDEX "ApplePhotosBackupItem_albumName_idx" ON "ApplePhotosBackupItem"("albumName");

-- CreateIndex
CREATE INDEX "ApplePhotosBackupItem_checksum_idx" ON "ApplePhotosBackupItem"("checksum");

-- CreateIndex
CREATE UNIQUE INDEX "ApplePhotosBackupItem_userId_applePhotoId_key" ON "ApplePhotosBackupItem"("userId", "applePhotoId");

-- CreateIndex
CREATE INDEX "Book_userId_idx" ON "Book"("userId");

-- CreateIndex
CREATE INDEX "Book_status_idx" ON "Book"("status");

-- CreateIndex
CREATE INDEX "Book_author_idx" ON "Book"("author");

-- CreateIndex
CREATE UNIQUE INDEX "Book_userId_isbn_key" ON "Book"("userId", "isbn");

-- CreateIndex
CREATE UNIQUE INDEX "Book_userId_goodreadsId_key" ON "Book"("userId", "goodreadsId");

-- CreateIndex
CREATE INDEX "BookNote_bookId_idx" ON "BookNote"("bookId");

-- CreateIndex
CREATE INDEX "BookNote_userId_idx" ON "BookNote"("userId");

-- CreateIndex
CREATE INDEX "BookHighlight_bookId_idx" ON "BookHighlight"("bookId");

-- CreateIndex
CREATE INDEX "BookHighlight_userId_idx" ON "BookHighlight"("userId");

-- CreateIndex
CREATE INDEX "ReadingSession_bookId_idx" ON "ReadingSession"("bookId");

-- CreateIndex
CREATE INDEX "ReadingSession_userId_idx" ON "ReadingSession"("userId");

-- CreateIndex
CREATE INDEX "ReadingSession_startedAt_idx" ON "ReadingSession"("startedAt");

-- CreateIndex
CREATE INDEX "Audiobook_userId_idx" ON "Audiobook"("userId");

-- CreateIndex
CREATE INDEX "Audiobook_title_idx" ON "Audiobook"("title");

-- CreateIndex
CREATE INDEX "Audiobook_author_idx" ON "Audiobook"("author");

-- CreateIndex
CREATE INDEX "Audiobook_isCompleted_idx" ON "Audiobook"("isCompleted");

-- CreateIndex
CREATE INDEX "Audiobook_lastPlayedAt_idx" ON "Audiobook"("lastPlayedAt");

-- CreateIndex
CREATE INDEX "WishlistItem_userId_idx" ON "WishlistItem"("userId");

-- CreateIndex
CREATE INDEX "WishlistItem_status_idx" ON "WishlistItem"("status");

-- CreateIndex
CREATE INDEX "WishlistItem_priority_idx" ON "WishlistItem"("priority");

-- CreateIndex
CREATE INDEX "WishlistItem_category_idx" ON "WishlistItem"("category");

-- CreateIndex
CREATE INDEX "WishlistPriceHistory_wishlistItemId_idx" ON "WishlistPriceHistory"("wishlistItemId");

-- CreateIndex
CREATE INDEX "WishlistPriceHistory_createdAt_idx" ON "WishlistPriceHistory"("createdAt");

-- CreateIndex
CREATE INDEX "Contact_userId_idx" ON "Contact"("userId");

-- CreateIndex
CREATE INDEX "Contact_lastName_idx" ON "Contact"("lastName");

-- CreateIndex
CREATE INDEX "Contact_email_idx" ON "Contact"("email");

-- CreateIndex
CREATE INDEX "Contact_lastContactedAt_idx" ON "Contact"("lastContactedAt");

-- CreateIndex
CREATE INDEX "Contact_birthday_idx" ON "Contact"("birthday");

-- CreateIndex
CREATE INDEX "ContactInteraction_contactId_idx" ON "ContactInteraction"("contactId");

-- CreateIndex
CREATE INDEX "ContactInteraction_userId_idx" ON "ContactInteraction"("userId");

-- CreateIndex
CREATE INDEX "ContactInteraction_date_idx" ON "ContactInteraction"("date");

-- CreateIndex
CREATE INDEX "ContactInteraction_type_idx" ON "ContactInteraction"("type");

-- CreateIndex
CREATE INDEX "ContactReminder_contactId_idx" ON "ContactReminder"("contactId");

-- CreateIndex
CREATE INDEX "ContactReminder_userId_idx" ON "ContactReminder"("userId");

-- CreateIndex
CREATE INDEX "ContactReminder_dueDate_idx" ON "ContactReminder"("dueDate");

-- CreateIndex
CREATE INDEX "ContactReminder_isCompleted_idx" ON "ContactReminder"("isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifySyncState_userId_key" ON "SpotifySyncState"("userId");

-- CreateIndex
CREATE INDEX "SpotifySyncState_userId_idx" ON "SpotifySyncState"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyProfile_userId_key" ON "SpotifyProfile"("userId");

-- CreateIndex
CREATE INDEX "SpotifyProfile_userId_idx" ON "SpotifyProfile"("userId");

-- CreateIndex
CREATE INDEX "SpotifyRecentlyPlayed_userId_idx" ON "SpotifyRecentlyPlayed"("userId");

-- CreateIndex
CREATE INDEX "SpotifyRecentlyPlayed_playedAt_idx" ON "SpotifyRecentlyPlayed"("playedAt");

-- CreateIndex
CREATE INDEX "SpotifyRecentlyPlayed_artistName_idx" ON "SpotifyRecentlyPlayed"("artistName");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyRecentlyPlayed_userId_spotifyTrackId_playedAt_key" ON "SpotifyRecentlyPlayed"("userId", "spotifyTrackId", "playedAt");

-- CreateIndex
CREATE INDEX "SpotifyTopTrack_userId_idx" ON "SpotifyTopTrack"("userId");

-- CreateIndex
CREATE INDEX "SpotifyTopTrack_timeRange_idx" ON "SpotifyTopTrack"("timeRange");

-- CreateIndex
CREATE INDEX "SpotifyTopTrack_rank_idx" ON "SpotifyTopTrack"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyTopTrack_userId_spotifyTrackId_timeRange_key" ON "SpotifyTopTrack"("userId", "spotifyTrackId", "timeRange");

-- CreateIndex
CREATE INDEX "SpotifyTopArtist_userId_idx" ON "SpotifyTopArtist"("userId");

-- CreateIndex
CREATE INDEX "SpotifyTopArtist_timeRange_idx" ON "SpotifyTopArtist"("timeRange");

-- CreateIndex
CREATE INDEX "SpotifyTopArtist_rank_idx" ON "SpotifyTopArtist"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyTopArtist_userId_spotifyArtistId_timeRange_key" ON "SpotifyTopArtist"("userId", "spotifyArtistId", "timeRange");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyPlaylist_spotifyPlaylistId_key" ON "SpotifyPlaylist"("spotifyPlaylistId");

-- CreateIndex
CREATE INDEX "SpotifyPlaylist_userId_idx" ON "SpotifyPlaylist"("userId");

-- CreateIndex
CREATE INDEX "SpotifyPlaylist_isOwnedByUser_idx" ON "SpotifyPlaylist"("isOwnedByUser");

-- CreateIndex
CREATE INDEX "MemoryFact_verificationStatus_idx" ON "MemoryFact"("verificationStatus");

-- CreateIndex
CREATE INDEX "Recording_factExtractionStatus_idx" ON "Recording"("factExtractionStatus");

-- AddForeignKey
ALTER TABLE "StepEntry" ADD CONSTRAINT "StepEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepSettings" ADD CONSTRAINT "StepSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplePhotosBackupSyncState" ADD CONSTRAINT "ApplePhotosBackupSyncState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplePhotosBackupItem" ADD CONSTRAINT "ApplePhotosBackupItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookNote" ADD CONSTRAINT "BookNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookNote" ADD CONSTRAINT "BookNote_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookHighlight" ADD CONSTRAINT "BookHighlight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookHighlight" ADD CONSTRAINT "BookHighlight_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingSession" ADD CONSTRAINT "ReadingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingSession" ADD CONSTRAINT "ReadingSession_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audiobook" ADD CONSTRAINT "Audiobook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistPriceHistory" ADD CONSTRAINT "WishlistPriceHistory_wishlistItemId_fkey" FOREIGN KEY ("wishlistItemId") REFERENCES "WishlistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactInteraction" ADD CONSTRAINT "ContactInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactInteraction" ADD CONSTRAINT "ContactInteraction_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactReminder" ADD CONSTRAINT "ContactReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactReminder" ADD CONSTRAINT "ContactReminder_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotifySyncState" ADD CONSTRAINT "SpotifySyncState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotifyProfile" ADD CONSTRAINT "SpotifyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotifyRecentlyPlayed" ADD CONSTRAINT "SpotifyRecentlyPlayed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotifyTopTrack" ADD CONSTRAINT "SpotifyTopTrack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotifyTopArtist" ADD CONSTRAINT "SpotifyTopArtist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotifyPlaylist" ADD CONSTRAINT "SpotifyPlaylist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
