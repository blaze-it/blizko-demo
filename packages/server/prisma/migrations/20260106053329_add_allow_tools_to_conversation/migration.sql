-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "allowTools" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
