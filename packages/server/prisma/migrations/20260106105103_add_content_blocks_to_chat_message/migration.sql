-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "contentBlocks" JSONB;

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
