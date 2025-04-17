/*
  # User Activity and Test Results Tracking

  1. New Tables
    - `user_activity`
      - Track all user actions and achievements
      - Store detailed activity history
    
    - `test_results`
      - Store comprehensive test results
      - Enable real-time leaderboard updates

  2. Security
    - Enable RLS
    - Add appropriate access policies
    
  3. Indexes
    - Optimize for real-time queries
    - Enable efficient filtering and sorting
*/

-- Create user activity table
CREATE TABLE IF NOT EXISTS user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  activity_type text NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  points_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create test results table
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  test_type text NOT NULL,
  score integer NOT NULL,
  accuracy numeric(5,2) NOT NULL,
  time_taken integer NOT NULL,
  difficulty text NOT NULL,
  category text NOT NULL,
  questions_total integer NOT NULL,
  questions_correct integer NOT NULL,
  streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- User activity policies
CREATE POLICY "Users can read own activity"
  ON user_activity
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON user_activity
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Test results policies
CREATE POLICY "Users can read own test results"
  ON test_results
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test results"
  ON test_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can read test results for leaderboard"
  ON test_results
  FOR SELECT
  USING (true);

-- Create indexes for better query performance
CREATE INDEX user_activity_user_id_idx ON user_activity(user_id);
CREATE INDEX user_activity_created_at_idx ON user_activity(created_at DESC);
CREATE INDEX user_activity_type_idx ON user_activity(activity_type);

CREATE INDEX test_results_user_id_idx ON test_results(user_id);
CREATE INDEX test_results_score_idx ON test_results(score DESC);
CREATE INDEX test_results_created_at_idx ON test_results(created_at DESC);
CREATE INDEX test_results_category_idx ON test_results(category);