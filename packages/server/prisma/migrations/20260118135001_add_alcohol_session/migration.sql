-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "AlcoholSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "units" DECIMAL(10,2) NOT NULL,
    "consumedAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT,
    "brand" TEXT,
    "abv" DECIMAL(5,2),
    "notes" TEXT,
    "rating" INTEGER,

    CONSTRAINT "AlcoholSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlcoholSession_userId_idx" ON "AlcoholSession"("userId");

-- CreateIndex
CREATE INDEX "AlcoholSession_consumedAt_idx" ON "AlcoholSession"("consumedAt");

-- AddForeignKey
ALTER TABLE "AlcoholSession" ADD CONSTRAINT "AlcoholSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
