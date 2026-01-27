-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "WeightEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "WeightEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeightSettings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "targetWeight" DECIMAL(5,2),
    "unit" TEXT NOT NULL DEFAULT 'kg',

    CONSTRAINT "WeightSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeightEntry_userId_idx" ON "WeightEntry"("userId");

-- CreateIndex
CREATE INDEX "WeightEntry_measuredAt_idx" ON "WeightEntry"("measuredAt");

-- CreateIndex
CREATE UNIQUE INDEX "WeightSettings_userId_key" ON "WeightSettings"("userId");

-- AddForeignKey
ALTER TABLE "WeightEntry" ADD CONSTRAINT "WeightEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightSettings" ADD CONSTRAINT "WeightSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
