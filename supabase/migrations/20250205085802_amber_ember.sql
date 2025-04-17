/*
  # Create users table with real-time capabilities

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `points` (integer)
      - `badges` (text array)
      - `level` (text)
      - `quiz_score` (integer)
      - `total_quizzes_taken` (integer)
      - `completed_courses` (text array)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read all users
    - Add policy for users to update their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  points integer DEFAULT 0,
  badges text[] DEFAULT '{}',
  level text DEFAULT 'beginner',
  quiz_score integer DEFAULT 0,
  total_quizzes_taken integer DEFAULT 0,
  completed_courses text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable row level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read all users (for leaderboard)
CREATE POLICY "Users can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);