-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "CaffeineSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "consumedAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT,
    "brand" TEXT,
    "size" TEXT,
    "notes" TEXT,
    "rating" INTEGER,

    CONSTRAINT "CaffeineSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CaffeineSession_userId_idx" ON "CaffeineSession"("userId");

-- CreateIndex
CREATE INDEX "CaffeineSession_consumedAt_idx" ON "CaffeineSession"("consumedAt");

-- AddForeignKey
ALTER TABLE "CaffeineSession" ADD CONSTRAINT "CaffeineSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
