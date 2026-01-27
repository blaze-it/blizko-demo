-- CreateEnum
CREATE TYPE "LocationSource" AS ENUM ('MOBILE_APP', 'GPX_IMPORT');

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- AlterTable
ALTER TABLE "SpotifySyncState" ADD COLUMN     "lastShowsSyncAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "NicotineSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "strength" INTEGER NOT NULL,
    "consumedAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT,
    "brand" TEXT,
    "notes" TEXT,
    "rating" INTEGER,

    CONSTRAINT "NicotineSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotifyShow" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "spotifyShowId" TEXT NOT NULL,
    "showName" TEXT NOT NULL,
    "showUrl" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "publisher" TEXT,
    "totalEpisodes" INTEGER NOT NULL DEFAULT 0,
    "mediaType" TEXT,
    "isExplicit" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SpotifyShow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotifyRecentlyPlayedEpisode" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "spotifyEpisodeId" TEXT NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "episodeName" TEXT NOT NULL,
    "episodeUrl" TEXT,
    "description" TEXT,
    "durationMs" INTEGER NOT NULL,
    "releaseDate" TEXT,
    "imageUrl" TEXT,
    "isExplicit" BOOLEAN NOT NULL DEFAULT false,
    "showName" TEXT NOT NULL,
    "showId" TEXT,
    "showUrl" TEXT,
    "showImageUrl" TEXT,
    "publisher" TEXT,
    "contextType" TEXT,
    "contextUri" TEXT,

    CONSTRAINT "SpotifyRecentlyPlayedEpisode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationPoint" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "altitude" DECIMAL(8,2),
    "accuracy" DECIMAL(6,2),
    "source" "LocationSource" NOT NULL,
    "speed" DECIMAL(6,2),
    "heading" DECIMAL(5,2),
    "placeName" TEXT,
    "timezone" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "LocationPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationSettings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trackingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "trackingInterval" INTEGER NOT NULL DEFAULT 1,
    "syncOnWifiOnly" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,

    CONSTRAINT "LocationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NicotineSession_userId_idx" ON "NicotineSession"("userId");

-- CreateIndex
CREATE INDEX "NicotineSession_consumedAt_idx" ON "NicotineSession"("consumedAt");

-- CreateIndex
CREATE INDEX "SpotifyShow_userId_idx" ON "SpotifyShow"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyShow_userId_spotifyShowId_key" ON "SpotifyShow"("userId", "spotifyShowId");

-- CreateIndex
CREATE INDEX "SpotifyRecentlyPlayedEpisode_userId_idx" ON "SpotifyRecentlyPlayedEpisode"("userId");

-- CreateIndex
CREATE INDEX "SpotifyRecentlyPlayedEpisode_playedAt_idx" ON "SpotifyRecentlyPlayedEpisode"("playedAt");

-- CreateIndex
CREATE INDEX "SpotifyRecentlyPlayedEpisode_showId_idx" ON "SpotifyRecentlyPlayedEpisode"("showId");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyRecentlyPlayedEpisode_userId_spotifyEpisodeId_played_key" ON "SpotifyRecentlyPlayedEpisode"("userId", "spotifyEpisodeId", "playedAt");

-- CreateIndex
CREATE INDEX "LocationPoint_userId_timestamp_idx" ON "LocationPoint"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "LocationPoint_userId_latitude_longitude_idx" ON "LocationPoint"("userId", "latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "LocationSettings_userId_key" ON "LocationSettings"("userId");

-- AddForeignKey
ALTER TABLE "NicotineSession" ADD CONSTRAINT "NicotineSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotifyShow" ADD CONSTRAINT "SpotifyShow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotifyRecentlyPlayedEpisode" ADD CONSTRAINT "SpotifyRecentlyPlayedEpisode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationPoint" ADD CONSTRAINT "LocationPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationSettings" ADD CONSTRAINT "LocationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
