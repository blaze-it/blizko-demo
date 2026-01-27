-- AlterEnum
ALTER TYPE "IntegrationType" ADD VALUE 'OPENROUTER';

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "model" TEXT;

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
