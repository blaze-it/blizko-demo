-- AlterTable
ALTER TABLE "BankConnection" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "syncCursor" TEXT;

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "externalId" TEXT;

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- CreateIndex
CREATE INDEX "Expense_externalId_idx" ON "Expense"("externalId");
