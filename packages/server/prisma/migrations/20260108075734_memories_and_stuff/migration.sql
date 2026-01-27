-- CreateEnum
CREATE TYPE "MemoryCategory" AS ENUM ('PERSONAL', 'PREFERENCE', 'PROJECT', 'RELATIONSHIP', 'HABIT', 'KNOWLEDGE', 'TEMPORAL');

-- CreateEnum
CREATE TYPE "MemoryImportance" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'EPHEMERAL');

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "enabledToolDomains" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "YogaSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "yogaType" TEXT NOT NULL,
    "difficultyLevel" INTEGER NOT NULL,
    "sessionAt" TIMESTAMP(3) NOT NULL,
    "instructor" TEXT,
    "source" TEXT,
    "poses" TEXT[],
    "moodBefore" INTEGER,
    "energyBefore" INTEGER,
    "moodAfter" INTEGER,
    "energyAfter" INTEGER,
    "notes" TEXT,
    "rating" INTEGER,

    CONSTRAINT "YogaSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YogaSettings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "dailySessionGoal" INTEGER,
    "weeklySessionGoal" INTEGER,
    "weeklyMinutesGoal" INTEGER,

    CONSTRAINT "YogaSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "category" "MemoryCategory" NOT NULL,
    "importance" "MemoryImportance" NOT NULL DEFAULT 'MEDIUM',
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "embedding" DOUBLE PRECISION[],
    "embeddingModel" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceConversationId" TEXT,
    "keywords" TEXT[],
    "entities" TEXT[],
    "metadata" JSONB,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoryFact" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subject" TEXT NOT NULL,
    "predicate" TEXT NOT NULL,
    "object" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "supersededBy" TEXT,
    "memoryId" TEXT NOT NULL,

    CONSTRAINT "MemoryFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemorySettings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "memoryEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoExtractionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "maxMemories" INTEGER NOT NULL DEFAULT 1000,
    "retentionDays" INTEGER,
    "excludeCategories" TEXT[],
    "excludeKeywords" TEXT[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "MemorySettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "YogaSession_userId_idx" ON "YogaSession"("userId");

-- CreateIndex
CREATE INDEX "YogaSession_sessionAt_idx" ON "YogaSession"("sessionAt");

-- CreateIndex
CREATE UNIQUE INDEX "YogaSettings_userId_key" ON "YogaSettings"("userId");

-- CreateIndex
CREATE INDEX "Memory_userId_idx" ON "Memory"("userId");

-- CreateIndex
CREATE INDEX "Memory_userId_category_idx" ON "Memory"("userId", "category");

-- CreateIndex
CREATE INDEX "Memory_category_idx" ON "Memory"("category");

-- CreateIndex
CREATE INDEX "Memory_importance_idx" ON "Memory"("importance");

-- CreateIndex
CREATE INDEX "Memory_lastAccessedAt_idx" ON "Memory"("lastAccessedAt");

-- CreateIndex
CREATE INDEX "MemoryFact_memoryId_idx" ON "MemoryFact"("memoryId");

-- CreateIndex
CREATE INDEX "MemoryFact_subject_idx" ON "MemoryFact"("subject");

-- CreateIndex
CREATE UNIQUE INDEX "MemorySettings_userId_key" ON "MemorySettings"("userId");

-- CreateIndex
CREATE INDEX "MemorySettings_userId_idx" ON "MemorySettings"("userId");

-- AddForeignKey
ALTER TABLE "YogaSession" ADD CONSTRAINT "YogaSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YogaSettings" ADD CONSTRAINT "YogaSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryFact" ADD CONSTRAINT "MemoryFact_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemorySettings" ADD CONSTRAINT "MemorySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
