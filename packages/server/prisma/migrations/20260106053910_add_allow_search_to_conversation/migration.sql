-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "allowSearch" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
