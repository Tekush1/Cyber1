/*
  # User Authentication and Profile Setup

  1. Tables
    - `profiles` table for user data
      - `id` (uuid, matches auth.users.id)
      - `name` (text)
      - `email` (text)
      - `points` (integer)
      - `badges` (text array)
      - `level` (text)
      - `quiz_score` (integer)
      - `total_quizzes_taken` (integer)
      - `completed_courses` (text array)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create profiles table instead of users (since auth.users is managed by Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text NOT NULL,
  email text NOT NULL,
  points integer DEFAULT 0,
  badges text[] DEFAULT '{}',
  level text DEFAULT 'beginner',
  quiz_score integer DEFAULT 0,
  total_quizzes_taken integer DEFAULT 0,
  completed_courses text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable row level security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles (for leaderboard)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);