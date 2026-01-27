-- Add missing taskId column to TimeEntry
ALTER TABLE "TimeEntry" ADD COLUMN "taskId" TEXT;

-- Add index on taskId
CREATE INDEX "TimeEntry_taskId_idx" ON "TimeEntry"("taskId");

-- Add foreign key constraint for taskId
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add missing sourceRecordingId column to Memory
ALTER TABLE "Memory" ADD COLUMN "sourceRecordingId" TEXT;

-- Add index on sourceRecordingId
CREATE INDEX "Memory_sourceRecordingId_idx" ON "Memory"("sourceRecordingId");

-- Add foreign key constraint for sourceRecordingId
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_sourceRecordingId_fkey" FOREIGN KEY ("sourceRecordingId") REFERENCES "Recording"("id") ON DELETE SET NULL ON UPDATE CASCADE;
