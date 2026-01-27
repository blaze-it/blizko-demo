/*
  Warnings:

  - The values [TODOIST,NOTION] on the enum `IntegrationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `coverImageUrl` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `notionPageId` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `notionUrl` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `originalCreatedAt` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `originalUpdatedAt` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the `NotionSyncState` table. If the table is not empty, all the data it contains will be lost.

*/
-- First, safely delete any UserIntegration rows using enum values that will be removed
DELETE FROM "UserIntegration" WHERE "type" IN ('TODOIST', 'NOTION');

-- AlterEnum
BEGIN;
CREATE TYPE "IntegrationType_new" AS ENUM ('TRADING212', 'AMUNDI', 'ETHERSCAN', 'BLOCKFROST', 'ETH_RPC', 'GOOGLE_CALENDAR', 'GMAIL', 'OPENROUTER', 'SALADCLOUD', 'GOCARDLESS', 'GITHUB', 'AIRLABS', 'OPGG', 'GOOGLE_MEET', 'OURA', 'S3', 'NEXTCLOUD');
ALTER TABLE "UserIntegration" ALTER COLUMN "type" TYPE "IntegrationType_new" USING ("type"::text::"IntegrationType_new");
ALTER TYPE "IntegrationType" RENAME TO "IntegrationType_old";
ALTER TYPE "IntegrationType_new" RENAME TO "IntegrationType";
DROP TYPE "public"."IntegrationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "NotionSyncState" DROP CONSTRAINT "NotionSyncState_userId_fkey";

-- DropIndex
DROP INDEX "Note_notionPageId_idx";

-- DropIndex
DROP INDEX "Note_notionPageId_key";

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "coverImageUrl",
DROP COLUMN "icon",
DROP COLUMN "notionPageId",
DROP COLUMN "notionUrl",
DROP COLUMN "originalCreatedAt",
DROP COLUMN "originalUpdatedAt";

-- DropTable
DROP TABLE "NotionSyncState";

-- CreateTable
CREATE TABLE "StoredFile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "checksum" TEXT,
    "s3Bucket" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "folder" TEXT,
    "tags" TEXT[],
    "metadata" JSONB,
    "nextcloudPath" TEXT,
    "nextcloudMigratedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "StoredFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NextcloudSyncState" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "lastMigrationAt" TIMESTAMP(3),
    "migratedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "migrationStatus" TEXT NOT NULL DEFAULT 'idle',
    "userId" TEXT NOT NULL,

    CONSTRAINT "NextcloudSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoredFile_userId_idx" ON "StoredFile"("userId");

-- CreateIndex
CREATE INDEX "StoredFile_userId_folder_idx" ON "StoredFile"("userId", "folder");

-- CreateIndex
CREATE INDEX "StoredFile_nextcloudPath_idx" ON "StoredFile"("nextcloudPath");

-- CreateIndex
CREATE INDEX "StoredFile_createdAt_idx" ON "StoredFile"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StoredFile_userId_s3Bucket_s3Key_key" ON "StoredFile"("userId", "s3Bucket", "s3Key");

-- CreateIndex
CREATE UNIQUE INDEX "NextcloudSyncState_userId_key" ON "NextcloudSyncState"("userId");

-- CreateIndex
CREATE INDEX "NextcloudSyncState_userId_idx" ON "NextcloudSyncState"("userId");

-- AddForeignKey
ALTER TABLE "StoredFile" ADD CONSTRAINT "StoredFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NextcloudSyncState" ADD CONSTRAINT "NextcloudSyncState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
