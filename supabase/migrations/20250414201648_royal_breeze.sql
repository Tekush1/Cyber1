/*
  # Add Settings Columns to Profiles Table

  1. Changes
    - Add notifications column (JSONB)
    - Add privacy column (JSONB)
    - Add default values for new columns

  2. Security
    - Maintain existing RLS policies
*/

-- Add notifications and privacy columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT json_build_object(
  'email', true,
  'quiz', true,
  'achievements', true,
  'security', true
),
ADD COLUMN IF NOT EXISTS privacy JSONB DEFAULT json_build_object(
  'showProfile', true,
  'showActivity', true,
  'showStats', true
);