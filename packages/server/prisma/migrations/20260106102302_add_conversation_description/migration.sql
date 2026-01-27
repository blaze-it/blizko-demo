-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
