-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "PushupsSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "sessionAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "notes" TEXT,
    "rating" INTEGER,

    CONSTRAINT "PushupsSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushupsSettings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionGoal" INTEGER NOT NULL DEFAULT 40,
    "dailyGoal" INTEGER,
    "weeklyGoal" INTEGER,

    CONSTRAINT "PushupsSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PushupsSession_userId_idx" ON "PushupsSession"("userId");

-- CreateIndex
CREATE INDEX "PushupsSession_sessionAt_idx" ON "PushupsSession"("sessionAt");

-- CreateIndex
CREATE UNIQUE INDEX "PushupsSettings_userId_key" ON "PushupsSettings"("userId");

-- AddForeignKey
ALTER TABLE "PushupsSession" ADD CONSTRAINT "PushupsSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushupsSettings" ADD CONSTRAINT "PushupsSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
