-- AlterEnum
ALTER TYPE "IntegrationType" ADD VALUE 'AIRLABS';

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
