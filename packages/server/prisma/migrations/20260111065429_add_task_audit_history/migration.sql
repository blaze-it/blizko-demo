-- CreateEnum
CREATE TYPE "TaskAuditAction" AS ENUM ('CREATED', 'UPDATED', 'COMPLETED', 'UNCOMPLETED', 'DELETED', 'RESTORED', 'MOVED', 'ATTACHMENT_ADDED', 'ATTACHMENT_REMOVED', 'COMMENT_ADDED', 'COMMENT_UPDATED', 'COMMENT_DELETED');

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "TaskAuditHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" "TaskAuditAction" NOT NULL,
    "changes" JSONB,
    "metadata" JSONB,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TaskAuditHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskAuditHistory_taskId_createdAt_idx" ON "TaskAuditHistory"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "TaskAuditHistory_userId_idx" ON "TaskAuditHistory"("userId");

-- AddForeignKey
ALTER TABLE "TaskAuditHistory" ADD CONSTRAINT "TaskAuditHistory_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAuditHistory" ADD CONSTRAINT "TaskAuditHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
