/*
  # Add Answered Questions Column to Profiles Table

  1. Changes
    - Add answered_questions column to store completed question IDs
    - Add default value as empty array
    - Update existing rows

  2. Security
    - Maintain existing RLS policies
*/

-- Add answered_questions column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS answered_questions text[] DEFAULT '{}';

-- Update existing rows to have empty array if null
UPDATE profiles 
SET answered_questions = '{}'
WHERE answered_questions IS NULL;