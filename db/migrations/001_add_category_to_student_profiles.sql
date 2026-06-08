-- Migration: 001_add_category_to_student_profiles.sql
-- Purpose: add `category` column to student_profiles and backfill default value

-- Up
BEGIN;

-- Add column if it does not exist
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS category TEXT;

-- Backfill a sensible default for existing rows where category is NULL or empty
UPDATE student_profiles
  SET category = 'General'
  WHERE category IS NULL OR TRIM(category) = '';

COMMIT;

-- Down
-- To roll back this migration, uncomment the DROP below and run.
-- BEGIN;
-- ALTER TABLE student_profiles DROP COLUMN IF EXISTS category;
-- COMMIT;
