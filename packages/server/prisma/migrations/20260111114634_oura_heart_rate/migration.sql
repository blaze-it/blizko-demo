/*
  Warnings:

  - You are about to drop the column `lastSyncAt` on the `OuraSyncState` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- AlterTable
ALTER TABLE "OuraSyncState" DROP COLUMN "lastSyncAt",
ADD COLUMN     "lastDailyActivitySyncAt" TIMESTAMP(3),
ADD COLUMN     "lastDailyReadinessSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastDailySleepSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastDailySpo2SyncAt" TIMESTAMP(3),
ADD COLUMN     "lastDailyStressSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastHeartRateSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastPersonalInfoSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastRestModeSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastRingConfigSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastSessionSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastSleepSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastSleepTimeSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastTagSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastWorkoutSyncAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "OuraHeartRateEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "bpm" INTEGER NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "OuraHeartRateEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OuraPersonalInfo" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "ouraUserId" TEXT,
    "email" TEXT,
    "age" INTEGER,
    "weight" DECIMAL(5,2),
    "height" DECIMAL(5,2),
    "biologicalSex" TEXT,

    CONSTRAINT "OuraPersonalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OuraDailySleep" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "ouraId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "score" INTEGER,
    "contributorDeepSleep" INTEGER,
    "contributorEfficiency" INTEGER,
    "contributorLatency" INTEGER,
    "contributorRemSleep" INTEGER,
    "contributorRestfulness" INTEGER,
    "contributorTiming" INTEGER,
    "contributorTotalSleep" INTEGER,
    "rawData" JSONB,

    CONSTRAINT "OuraDailySleep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OuraDailyActivity" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "ouraId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "score" INTEGER,
    "contributorMeetDailyTargets" INTEGER,
    "contributorMoveEveryHour" INTEGER,
    "contributorRecoveryTime" INTEGER,
    "contributorStayActive" INTEGER,
    "contributorTrainingFrequency" INTEGER,
    "contributorTrainingVolume" INTEGER,
    "activeCalories" INTEGER,
    "totalCalories" INTEGER,
    "steps" INTEGER,
    "equivalentWalkingDistance" INTEGER,
    "highActivityTime" INTEGER,
    "mediumActivityTime" INTEGER,
    "lowActivityTime" INTEGER,
    "sedentaryTime" INTEGER,
    "restingTime" INTEGER,
    "inactivityAlerts" INTEGER,
    "targetCalories" INTEGER,
    "targetMeters" INTEGER,
    "metData" JSONB,
    "rawData" JSONB,

    CONSTRAINT "OuraDailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OuraDailyReadiness" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "ouraId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "score" INTEGER,
    "contributorActivityBalance" INTEGER,
    "contributorBodyTemperature" INTEGER,
    "contributorHrvBalance" INTEGER,
    "contributorPreviousDayActivity" INTEGER,
    "contributorPreviousNight" INTEGER,
    "contributorRecoveryIndex" INTEGER,
    "contributorRestingHeartRate" INTEGER,
    "contributorSleepBalance" INTEGER,
    "temperatureDeviation" DECIMAL(4,2),
    "temperatureTrendDeviation" DECIMAL(4,2),
    "rawData" JSONB,

    CONSTRAINT "OuraDailyReadiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OuraDailySpo2" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "ouraId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "spo2Average" DECIMAL(5,2),
    "breathingDisturbanceIndex" DECIMAL(5,2),
    "rawData" JSONB,

    CONSTRAINT "OuraDailySpo2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OuraDailyStress" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "ouraId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "stressHigh" INTEGER,
    "recoveryHigh" INTEGER,
    "daytimeStress" INTEGER,
    "rawData" JSONB,

    CONSTRAINT "OuraDailyStress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OuraWorkout" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "ouraId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "activity" TEXT,
    "startDatetime" TIMESTAMP(3),
    "endDatetime" TIMESTAMP(3),
    "duration" INTEGER,
    "distance" INTEGER,
    "calories" INTEGER,
    "intensity" TEXT,
    "label" TEXT,
    "source" TEXT,
    "averageHeartRate" INTEGER,
    "maxHeartRate" INTEGER,
    "rawData" JSONB,

    CONSTRAINT "OuraWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OuraSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "ouraId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "type" TEXT,
    "startDatetime" TIMESTAMP(3),
    "endDatetime" TIMESTAMP(3),
    "duration" INTEGER,
    "moodBefore" TEXT,
    "moodAfter" TEXT,
    "averageHeartRate" INTEGER,
    "minHeartRate" INTEGER,
    "maxHeartRate" INTEGER,
    "heartRateVariability" INTEGER,
    "motionCount" INTEGER,
    "rawData" JSONB,

    CONSTRAINT "OuraSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OuraTag" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "ouraId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "timestamp" TIMESTAMP(3),
    "text" TEXT,
    "tags" JSONB,
    "tagData" JSONB,
    "rawData" JSONB,

    CONSTRAINT "OuraTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OuraRingConfiguration" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "color" TEXT,
    "design" TEXT,
    "firmwareVersion" TEXT,
    "hardwareType" TEXT,
    "setUpAt" TIMESTAMP(3),
    "size" INTEGER,
    "rawData" JSONB,

    CONSTRAINT "OuraRingConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OuraSleepTime" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TIMESTAMP(3),
    "optimalBedtimeStart" TIMESTAMP(3),
    "optimalBedtimeEnd" TIMESTAMP(3),
    "optimalWakeupTimeStart" TIMESTAMP(3),
    "optimalWakeupTimeEnd" TIMESTAMP(3),
    "recommendation" TEXT,
    "status" TEXT,
    "rawData" JSONB,

    CONSTRAINT "OuraSleepTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OuraRestModePeriod" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "ouraId" TEXT NOT NULL,
    "startDay" TIMESTAMP(3),
    "endDay" TIMESTAMP(3),
    "endReason" TEXT,
    "rawData" JSONB,

    CONSTRAINT "OuraRestModePeriod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OuraHeartRateEntry_userId_idx" ON "OuraHeartRateEntry"("userId");

-- CreateIndex
CREATE INDEX "OuraHeartRateEntry_timestamp_idx" ON "OuraHeartRateEntry"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "OuraHeartRateEntry_userId_timestamp_key" ON "OuraHeartRateEntry"("userId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "OuraPersonalInfo_userId_key" ON "OuraPersonalInfo"("userId");

-- CreateIndex
CREATE INDEX "OuraPersonalInfo_userId_idx" ON "OuraPersonalInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OuraDailySleep_ouraId_key" ON "OuraDailySleep"("ouraId");

-- CreateIndex
CREATE INDEX "OuraDailySleep_userId_idx" ON "OuraDailySleep"("userId");

-- CreateIndex
CREATE INDEX "OuraDailySleep_day_idx" ON "OuraDailySleep"("day");

-- CreateIndex
CREATE UNIQUE INDEX "OuraDailySleep_userId_day_key" ON "OuraDailySleep"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "OuraDailyActivity_ouraId_key" ON "OuraDailyActivity"("ouraId");

-- CreateIndex
CREATE INDEX "OuraDailyActivity_userId_idx" ON "OuraDailyActivity"("userId");

-- CreateIndex
CREATE INDEX "OuraDailyActivity_day_idx" ON "OuraDailyActivity"("day");

-- CreateIndex
CREATE UNIQUE INDEX "OuraDailyActivity_userId_day_key" ON "OuraDailyActivity"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "OuraDailyReadiness_ouraId_key" ON "OuraDailyReadiness"("ouraId");

-- CreateIndex
CREATE INDEX "OuraDailyReadiness_userId_idx" ON "OuraDailyReadiness"("userId");

-- CreateIndex
CREATE INDEX "OuraDailyReadiness_day_idx" ON "OuraDailyReadiness"("day");

-- CreateIndex
CREATE UNIQUE INDEX "OuraDailyReadiness_userId_day_key" ON "OuraDailyReadiness"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "OuraDailySpo2_ouraId_key" ON "OuraDailySpo2"("ouraId");

-- CreateIndex
CREATE INDEX "OuraDailySpo2_userId_idx" ON "OuraDailySpo2"("userId");

-- CreateIndex
CREATE INDEX "OuraDailySpo2_day_idx" ON "OuraDailySpo2"("day");

-- CreateIndex
CREATE UNIQUE INDEX "OuraDailySpo2_userId_day_key" ON "OuraDailySpo2"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "OuraDailyStress_ouraId_key" ON "OuraDailyStress"("ouraId");

-- CreateIndex
CREATE INDEX "OuraDailyStress_userId_idx" ON "OuraDailyStress"("userId");

-- CreateIndex
CREATE INDEX "OuraDailyStress_day_idx" ON "OuraDailyStress"("day");

-- CreateIndex
CREATE UNIQUE INDEX "OuraDailyStress_userId_day_key" ON "OuraDailyStress"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "OuraWorkout_ouraId_key" ON "OuraWorkout"("ouraId");

-- CreateIndex
CREATE INDEX "OuraWorkout_userId_idx" ON "OuraWorkout"("userId");

-- CreateIndex
CREATE INDEX "OuraWorkout_day_idx" ON "OuraWorkout"("day");

-- CreateIndex
CREATE INDEX "OuraWorkout_startDatetime_idx" ON "OuraWorkout"("startDatetime");

-- CreateIndex
CREATE UNIQUE INDEX "OuraSession_ouraId_key" ON "OuraSession"("ouraId");

-- CreateIndex
CREATE INDEX "OuraSession_userId_idx" ON "OuraSession"("userId");

-- CreateIndex
CREATE INDEX "OuraSession_day_idx" ON "OuraSession"("day");

-- CreateIndex
CREATE INDEX "OuraSession_startDatetime_idx" ON "OuraSession"("startDatetime");

-- CreateIndex
CREATE UNIQUE INDEX "OuraTag_ouraId_key" ON "OuraTag"("ouraId");

-- CreateIndex
CREATE INDEX "OuraTag_userId_idx" ON "OuraTag"("userId");

-- CreateIndex
CREATE INDEX "OuraTag_day_idx" ON "OuraTag"("day");

-- CreateIndex
CREATE INDEX "OuraTag_timestamp_idx" ON "OuraTag"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "OuraRingConfiguration_userId_key" ON "OuraRingConfiguration"("userId");

-- CreateIndex
CREATE INDEX "OuraRingConfiguration_userId_idx" ON "OuraRingConfiguration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OuraSleepTime_userId_key" ON "OuraSleepTime"("userId");

-- CreateIndex
CREATE INDEX "OuraSleepTime_userId_idx" ON "OuraSleepTime"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OuraRestModePeriod_ouraId_key" ON "OuraRestModePeriod"("ouraId");

-- CreateIndex
CREATE INDEX "OuraRestModePeriod_userId_idx" ON "OuraRestModePeriod"("userId");

-- CreateIndex
CREATE INDEX "OuraRestModePeriod_startDay_idx" ON "OuraRestModePeriod"("startDay");

-- AddForeignKey
ALTER TABLE "OuraHeartRateEntry" ADD CONSTRAINT "OuraHeartRateEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OuraPersonalInfo" ADD CONSTRAINT "OuraPersonalInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OuraDailySleep" ADD CONSTRAINT "OuraDailySleep_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OuraDailyActivity" ADD CONSTRAINT "OuraDailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OuraDailyReadiness" ADD CONSTRAINT "OuraDailyReadiness_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OuraDailySpo2" ADD CONSTRAINT "OuraDailySpo2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OuraDailyStress" ADD CONSTRAINT "OuraDailyStress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OuraWorkout" ADD CONSTRAINT "OuraWorkout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OuraSession" ADD CONSTRAINT "OuraSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OuraTag" ADD CONSTRAINT "OuraTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OuraRingConfiguration" ADD CONSTRAINT "OuraRingConfiguration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OuraSleepTime" ADD CONSTRAINT "OuraSleepTime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OuraRestModePeriod" ADD CONSTRAINT "OuraRestModePeriod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
