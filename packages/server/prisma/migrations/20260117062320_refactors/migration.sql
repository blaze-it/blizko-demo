-- AlterTable
ALTER TABLE "Audiobook" ADD COLUMN     "audioStorageKey" TEXT,
ADD COLUMN     "coverStorageKey" TEXT;

-- AlterTable
ALTER TABLE "ChatAttachment" ADD COLUMN     "storageKey" TEXT;

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- AlterTable
ALTER TABLE "JournalAttachment" ADD COLUMN     "storageKey" TEXT;

-- AlterTable
ALTER TABLE "Recording" ADD COLUMN     "audioStorageKey" TEXT,
ADD COLUMN     "subtitleStorageKey" TEXT,
ADD COLUMN     "transcriptStorageKey" TEXT;

-- AlterTable
ALTER TABLE "TaskAttachment" ADD COLUMN     "storageKey" TEXT;

-- AlterTable
ALTER TABLE "UserImage" ADD COLUMN     "storageKey" TEXT;

-- CreateIndex
CREATE INDEX "GmailMessage_userId_internalDate_idx" ON "GmailMessage"("userId", "internalDate");

-- CreateIndex
CREATE INDEX "GmailMessage_userId_isRead_idx" ON "GmailMessage"("userId", "isRead");

-- CreateIndex
CREATE INDEX "OuraDailyActivity_userId_day_idx" ON "OuraDailyActivity"("userId", "day");

-- CreateIndex
CREATE INDEX "OuraDailyReadiness_userId_day_idx" ON "OuraDailyReadiness"("userId", "day");

-- CreateIndex
CREATE INDEX "OuraDailySleep_userId_day_idx" ON "OuraDailySleep"("userId", "day");

-- CreateIndex
CREATE INDEX "OuraDailySpo2_userId_day_idx" ON "OuraDailySpo2"("userId", "day");

-- CreateIndex
CREATE INDEX "OuraDailyStress_userId_day_idx" ON "OuraDailyStress"("userId", "day");

-- CreateIndex
CREATE INDEX "Task_userId_checked_idx" ON "Task"("userId", "checked");

-- CreateIndex
CREATE INDEX "Task_userId_projectId_checked_idx" ON "Task"("userId", "projectId", "checked");

-- CreateIndex
CREATE INDEX "Task_userId_completedAt_idx" ON "Task"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "TimeEntry_userId_startTime_idx" ON "TimeEntry"("userId", "startTime");
