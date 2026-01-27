/*
  Warnings:

  - The values [CLOCKIFY] on the enum `IntegrationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `clockifyTimeEntryId` on the `CalorieEntry` table. All the data in the column will be lost.
  - You are about to drop the column `clockifySyncedAt` on the `Recording` table. All the data in the column will be lost.
  - You are about to drop the column `clockifyTimeEntryId` on the `Recording` table. All the data in the column will be lost.
  - You are about to drop the column `clockifyTimeEntryId` on the `WheatSession` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "IntegrationType_new" AS ENUM ('TRADING212', 'AMUNDI', 'ETHERSCAN', 'BLOCKFROST', 'ETH_RPC', 'TELEGRAM', 'GOOGLE_CALENDAR', 'TODOIST', 'GMAIL');
ALTER TABLE "UserIntegration" ALTER COLUMN "type" TYPE "IntegrationType_new" USING ("type"::text::"IntegrationType_new");
ALTER TYPE "IntegrationType" RENAME TO "IntegrationType_old";
ALTER TYPE "IntegrationType_new" RENAME TO "IntegrationType";
DROP TYPE "public"."IntegrationType_old";
COMMIT;

-- DropIndex
DROP INDEX "TimeEntry_userId_externalId_externalSource_key";

-- AlterTable
ALTER TABLE "CalorieEntry" DROP COLUMN "clockifyTimeEntryId";

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "clientId" TEXT;

-- AlterTable
ALTER TABLE "Recording" DROP COLUMN "clockifySyncedAt",
DROP COLUMN "clockifyTimeEntryId";

-- AlterTable
ALTER TABLE "TimeEntry" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "WheatSession" DROP COLUMN "clockifyTimeEntryId";

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "notes" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Client_userId_idx" ON "Client"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_name_key" ON "Client"("userId", "name");

-- CreateIndex
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");

-- CreateIndex
CREATE INDEX "TimeEntry_projectId_idx" ON "TimeEntry"("projectId");

-- CreateIndex
CREATE INDEX "TimeEntry_clientId_idx" ON "TimeEntry"("clientId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
