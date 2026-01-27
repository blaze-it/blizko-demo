-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "IntegrationType" ADD VALUE 'OPGG';
ALTER TYPE "IntegrationType" ADD VALUE 'GOOGLE_MEET';
ALTER TYPE "IntegrationType" ADD VALUE 'OURA';

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "LeagueSyncState" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "lastMatchId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "LeagueSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleMeetSyncState" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "GoogleMeetSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OuraSyncState" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "OuraSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OuraSleepEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "ouraSessionId" TEXT NOT NULL,
    "sleepDate" TIMESTAMP(3) NOT NULL,
    "bedtimeStart" TIMESTAMP(3) NOT NULL,
    "bedtimeEnd" TIMESTAMP(3) NOT NULL,
    "totalSleepDuration" INTEGER NOT NULL,
    "deepSleepDuration" INTEGER,
    "lightSleepDuration" INTEGER,
    "remSleepDuration" INTEGER,
    "awakeTime" INTEGER,
    "sleepScore" INTEGER,
    "sleepEfficiency" INTEGER,
    "restingHeartRate" INTEGER,
    "heartRateVariability" INTEGER,
    "respiratoryRate" DECIMAL(4,2),
    "temperatureDeviation" DECIMAL(4,2),
    "timezone" TEXT,

    CONSTRAINT "OuraSleepEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeagueSyncState_userId_key" ON "LeagueSyncState"("userId");

-- CreateIndex
CREATE INDEX "LeagueSyncState_userId_idx" ON "LeagueSyncState"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleMeetSyncState_userId_key" ON "GoogleMeetSyncState"("userId");

-- CreateIndex
CREATE INDEX "GoogleMeetSyncState_userId_idx" ON "GoogleMeetSyncState"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OuraSyncState_userId_key" ON "OuraSyncState"("userId");

-- CreateIndex
CREATE INDEX "OuraSyncState_userId_idx" ON "OuraSyncState"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OuraSleepEntry_ouraSessionId_key" ON "OuraSleepEntry"("ouraSessionId");

-- CreateIndex
CREATE INDEX "OuraSleepEntry_userId_idx" ON "OuraSleepEntry"("userId");

-- CreateIndex
CREATE INDEX "OuraSleepEntry_sleepDate_idx" ON "OuraSleepEntry"("sleepDate");

-- CreateIndex
CREATE INDEX "OuraSleepEntry_bedtimeStart_idx" ON "OuraSleepEntry"("bedtimeStart");

-- AddForeignKey
ALTER TABLE "LeagueSyncState" ADD CONSTRAINT "LeagueSyncState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleMeetSyncState" ADD CONSTRAINT "GoogleMeetSyncState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OuraSyncState" ADD CONSTRAINT "OuraSyncState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OuraSleepEntry" ADD CONSTRAINT "OuraSleepEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
