/*
  # Enhanced User Data Tracking

  1. New Tables
    - `user_progress`
      - Track detailed game progress
      - Store course completion data
      - Quiz performance metrics
    
    - `game_history`
      - Track individual game sessions
      - Store performance metrics
    
  2. Security
    - Enable RLS
    - Add appropriate access policies
    
  3. Indexes
    - Optimize for frequent queries
    - Enable efficient filtering and sorting
*/

-- Create user progress tracking table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  total_games_played integer DEFAULT 0,
  total_courses_completed integer DEFAULT 0,
  total_quizzes_completed integer DEFAULT 0,
  total_time_spent integer DEFAULT 0, -- in minutes
  highest_score integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game history table
CREATE TABLE IF NOT EXISTS game_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  game_type text NOT NULL,
  score integer NOT NULL,
  duration integer NOT NULL, -- in seconds
  difficulty text NOT NULL,
  completed boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;

-- User progress policies
CREATE POLICY "Users can read own progress"
  ON user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Game history policies
CREATE POLICY "Users can read own game history"
  ON game_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game history"
  ON game_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX user_progress_user_id_idx ON user_progress(user_id);
CREATE INDEX user_progress_updated_at_idx ON user_progress(updated_at DESC);
CREATE INDEX game_history_user_id_idx ON game_history(user_id);
CREATE INDEX game_history_game_type_idx ON game_history(game_type);
CREATE INDEX game_history_created_at_idx ON game_history(created_at DESC);

-- Add trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_user_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_progress_timestamp
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_progress_updated_at();