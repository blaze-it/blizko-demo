-- CreateEnum
CREATE TYPE "GitHubPRState" AS ENUM ('OPEN', 'CLOSED', 'MERGED');

-- CreateEnum
CREATE TYPE "GitHubReviewDecision" AS ENUM ('APPROVED', 'CHANGES_REQUESTED', 'REVIEW_REQUIRED');

-- CreateEnum
CREATE TYPE "GitHubReviewState" AS ENUM ('PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'COMMENTED', 'DISMISSED');

-- AlterEnum
ALTER TYPE "NotificationCategory" ADD VALUE 'GITHUB';

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'GITHUB_REVIEW_REQUESTED';

-- AlterTable
ALTER TABLE "GitHubSyncState" ADD COLUMN     "lastPRsSyncAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "GitHubPullRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "githubPrId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "nodeId" TEXT NOT NULL,
    "repoFullName" TEXT NOT NULL,
    "repoId" INTEGER,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "state" "GitHubPRState" NOT NULL,
    "draft" BOOLEAN NOT NULL DEFAULT false,
    "authorLogin" TEXT NOT NULL,
    "authorAvatarUrl" TEXT,
    "htmlUrl" TEXT NOT NULL,
    "diffUrl" TEXT,
    "patchUrl" TEXT,
    "reviewDecision" "GitHubReviewDecision",
    "reviewRequestedAt" TIMESTAMP(3),
    "isReviewRequested" BOOLEAN NOT NULL DEFAULT false,
    "userReviewState" "GitHubReviewState",
    "mergeable" BOOLEAN,
    "mergedAt" TIMESTAMP(3),
    "mergedBy" TEXT,
    "mergeCommitSha" TEXT,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "changedFiles" INTEGER NOT NULL DEFAULT 0,
    "commits" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "headRef" TEXT NOT NULL,
    "headSha" TEXT NOT NULL,
    "baseRef" TEXT NOT NULL,
    "baseSha" TEXT,
    "labels" JSONB,
    "githubCreatedAt" TIMESTAMP(3) NOT NULL,
    "githubUpdatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3),
    "notifiedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "GitHubPullRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GitHubPullRequest_userId_idx" ON "GitHubPullRequest"("userId");

-- CreateIndex
CREATE INDEX "GitHubPullRequest_repoFullName_idx" ON "GitHubPullRequest"("repoFullName");

-- CreateIndex
CREATE INDEX "GitHubPullRequest_state_idx" ON "GitHubPullRequest"("state");

-- CreateIndex
CREATE INDEX "GitHubPullRequest_isReviewRequested_idx" ON "GitHubPullRequest"("isReviewRequested");

-- CreateIndex
CREATE INDEX "GitHubPullRequest_githubUpdatedAt_idx" ON "GitHubPullRequest"("githubUpdatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubPullRequest_userId_githubPrId_key" ON "GitHubPullRequest"("userId", "githubPrId");

-- AddForeignKey
ALTER TABLE "GitHubPullRequest" ADD CONSTRAINT "GitHubPullRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
