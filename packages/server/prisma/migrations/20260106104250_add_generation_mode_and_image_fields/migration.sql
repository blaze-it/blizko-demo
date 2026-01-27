-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "costUsd" DECIMAL(10,6),
ADD COLUMN     "imageMetadata" JSONB,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "favoriteModels" JSONB,
ADD COLUMN     "generationMode" TEXT NOT NULL DEFAULT 'text';

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
