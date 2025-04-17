import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Brain, Star, Loader, AlertCircle, Crown, Target, Clock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  points: number;
  quiz_score: number;
  total_quizzes_taken: number;
  level: string;
  best_streak?: number;
  average_time?: number;
}

export function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'points' | 'quiz_score' | 'total_quizzes_taken'>('points');
  const [timeFrame, setTimeFrame] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy, timeFrame]);

  const fetchLeaderboard = async () => {
    try {
      setError(null);
      let query = supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          points,
          quiz_score,
          total_quizzes_taken,
          level,
          quiz_history(
            score,
            time_taken,
            created_at
          )
        `);

      if (timeFrame === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('created_at', weekAgo.toISOString());
      } else if (timeFrame === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('created_at', monthAgo.toISOString());
      }

      const { data, error: fetchError } = await query
        .order(sortBy, { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;

      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Unable to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Leaderboard</h2>
        <p className="text-gray-400 text-center max-w-md mb-4">{error}</p>
        <button 
          onClick={fetchLeaderboard}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Global Leaderboard</h1>
          <p className="text-gray-400">Top cybersecurity learners worldwide</p>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <div className="flex rounded-lg overflow-hidden border border-gray-800">
            <button
              onClick={() => setSortBy('points')}
              className={`px-4 py-2 flex items-center ${
                sortBy === 'points'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Points
            </button>
            <button
              onClick={() => setSortBy('quiz_score')}
              className={`px-4 py-2 flex items-center ${
                sortBy === 'quiz_score'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Brain className="w-4 h-4 mr-2" />
              Quiz Score
            </button>
            <button
              onClick={() => setSortBy('total_quizzes_taken')}
              className={`px-4 py-2 flex items-center ${
                sortBy === 'total_quizzes_taken'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Target className="w-4 h-4 mr-2" />
              Total Quizzes
            </button>
          </div>

          <div className="flex rounded-lg overflow-hidden border border-gray-800">
            <button
              onClick={() => setTimeFrame('all')}
              className={`px-4 py-2 ${
                timeFrame === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFrame('month')}
              className={`px-4 py-2 ${
                timeFrame === 'month'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeFrame('week')}
              className={`px-4 py-2 ${
                timeFrame === 'week'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              This Week
            </button>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 overflow-hidden">
          <div className="p-6">
            {users.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index < 3 ? 'bg-gray-800/50' : 'bg-gray-900/30'
                } mb-4 hover:bg-gray-800 transition-colors`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {index === 0 && <Crown className="w-8 h-8 text-yellow-500" />}
                    {index === 1 && <Medal className="w-8 h-8 text-gray-400" />}
                    {index === 2 && <Award className="w-8 h-8 text-yellow-700" />}
                    {index > 2 && (
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{user.name}</h3>
                    <span className={`text-sm ${
                      user.level === 'beginner' ? 'text-green-500' :
                      user.level === 'intermediate' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {user.level.charAt(0).toUpperCase() + user.level.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Quiz Score</div>
                    <div className="font-bold text-blue-500">{user.quiz_score}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Quizzes</div>
                    <div className="font-bold text-purple-500">{user.total_quizzes_taken}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Points</div>
                    <div className="font-bold text-yellow-500">{user.points}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}