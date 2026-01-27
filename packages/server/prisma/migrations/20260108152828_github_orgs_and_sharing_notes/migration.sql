/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `Note` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "GitHubSyncState" ADD COLUMN     "lastOrgsSyncAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "shareExpiresAt" TIMESTAMP(3),
ADD COLUMN     "shareToken" TEXT;

-- CreateTable
CREATE TABLE "GitHubOrganization" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "githubId" INTEGER NOT NULL,
    "login" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "description" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "publicReposCount" INTEGER NOT NULL DEFAULT 0,
    "htmlUrl" TEXT NOT NULL,
    "syncedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "GitHubOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GitHubOrganization_userId_idx" ON "GitHubOrganization"("userId");

-- CreateIndex
CREATE INDEX "GitHubOrganization_login_idx" ON "GitHubOrganization"("login");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubOrganization_userId_githubId_key" ON "GitHubOrganization"("userId", "githubId");

-- CreateIndex
CREATE UNIQUE INDEX "Note_shareToken_key" ON "Note"("shareToken");

-- CreateIndex
CREATE INDEX "Note_shareToken_idx" ON "Note"("shareToken");

-- AddForeignKey
ALTER TABLE "GitHubOrganization" ADD CONSTRAINT "GitHubOrganization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
