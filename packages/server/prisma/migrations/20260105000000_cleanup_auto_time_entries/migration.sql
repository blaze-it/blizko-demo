-- Delete auto-created TimeEntry records for Wheat, Calories, and Recordings
-- These were created by deprecated functions and are now handled as virtual entries

DELETE FROM "TimeEntry"
WHERE "projectName" IN ('Wheat', 'Calories', 'Recordings');
