/*
  Warnings:

  - You are about to drop the column `hasAttachments` on the `GmailMessage` table. All the data in the column will be lost.
  - You are about to drop the column `sizeEstimate` on the `GmailMessage` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('TERRIBLE', 'BAD', 'NEUTRAL', 'GOOD', 'GREAT');

-- DropIndex
DROP INDEX "GmailMessage_gmailId_idx";

-- DropIndex
DROP INDEX "GmailMessage_receivedAt_idx";

-- AlterTable
ALTER TABLE "GmailMessage" DROP COLUMN "hasAttachments",
DROP COLUMN "sizeEstimate",
ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "historyId" TEXT,
ADD COLUMN     "isSpam" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "mood" "Mood",
    "tags" TEXT[],

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalAttachment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blob" BYTEA NOT NULL,
    "contentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "altText" TEXT,
    "journalEntryId" TEXT NOT NULL,

    CONSTRAINT "JournalAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JournalEntry_userId_idx" ON "JournalEntry"("userId");

-- CreateIndex
CREATE INDEX "JournalEntry_entryDate_idx" ON "JournalEntry"("entryDate");

-- CreateIndex
CREATE INDEX "JournalAttachment_journalEntryId_idx" ON "JournalAttachment"("journalEntryId");

-- CreateIndex
CREATE INDEX "GmailMessage_internalDate_idx" ON "GmailMessage"("internalDate");

-- CreateIndex
CREATE INDEX "GmailMessage_isRead_idx" ON "GmailMessage"("isRead");

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalAttachment" ADD CONSTRAINT "JournalAttachment_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
