-- Add timezone fields to all time-sensitive models
-- This migration adds IANA timezone string fields to properly handle timezone-aware timestamps

-- Task
ALTER TABLE "Task" ADD COLUMN "timezone" TEXT;

-- TimeEntry
ALTER TABLE "TimeEntry" ADD COLUMN "timezone" TEXT;

-- WheatSession
ALTER TABLE "WheatSession" ADD COLUMN "timezone" TEXT;

-- CaffeineSession
ALTER TABLE "CaffeineSession" ADD COLUMN "timezone" TEXT;

-- AlcoholSession
ALTER TABLE "AlcoholSession" ADD COLUMN "timezone" TEXT;

-- CalorieEntry
ALTER TABLE "CalorieEntry" ADD COLUMN "timezone" TEXT;

-- WeightEntry
ALTER TABLE "WeightEntry" ADD COLUMN "timezone" TEXT;

-- StepEntry
ALTER TABLE "StepEntry" ADD COLUMN "timezone" TEXT;

-- YogaSession
ALTER TABLE "YogaSession" ADD COLUMN "timezone" TEXT;

-- PushupsSession
ALTER TABLE "PushupsSession" ADD COLUMN "timezone" TEXT;

-- Flight (departure and arrival timezones)
ALTER TABLE "Flight" ADD COLUMN "departureTimezone" TEXT;
ALTER TABLE "Flight" ADD COLUMN "arrivalTimezone" TEXT;

-- JournalEntry
ALTER TABLE "JournalEntry" ADD COLUMN "timezone" TEXT;
