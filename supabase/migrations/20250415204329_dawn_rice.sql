/*
  # Add updated_at Column to Profiles Table

  1. Changes
    - Add updated_at column to profiles table
    - Add trigger to automatically update the timestamp
    - Backfill existing rows with current timestamp

  2. Security
    - Maintain existing RLS policies
*/

-- Add updated_at column if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Update existing rows to set updated_at
UPDATE profiles 
SET updated_at = created_at 
WHERE updated_at IS NULL;