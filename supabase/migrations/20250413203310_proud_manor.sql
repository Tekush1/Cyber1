/*
  # Add Quiz History Table

  1. New Tables
    - `quiz_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `score` (integer)
      - `questions_answered` (integer)
      - `correct_answers` (integer)
      - `time_taken` (integer)
      - `category` (text)
      - `difficulty` (text)
      - `best_streak` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create quiz history table
CREATE TABLE IF NOT EXISTS quiz_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  score integer NOT NULL,
  questions_answered integer NOT NULL,
  correct_answers integer NOT NULL,
  time_taken integer NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL,
  best_streak integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable row level security
ALTER TABLE quiz_history ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own quiz results
CREATE POLICY "Users can insert own quiz results"
  ON quiz_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own quiz results
CREATE POLICY "Users can read own quiz results"
  ON quiz_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX quiz_history_user_id_idx ON quiz_history(user_id);
CREATE INDEX quiz_history_created_at_idx ON quiz_history(created_at DESC);
CREATE INDEX quiz_history_score_idx ON quiz_history(score DESC);