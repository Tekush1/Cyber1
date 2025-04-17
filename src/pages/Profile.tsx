import React, { useState, useEffect } from 'react';
import {
  User,
  Trophy,
  Star,
  Target,
  Brain,
  Clock,
  Award,
  Shield,
  Terminal,
  BookOpen,
  ChevronRight,
  BarChart,
  Zap,
  Crown,
  Medal,
  Flag,
  Activity,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface UserActivity {
  id: string;
  activity_type: string;
  description: string;
  points_earned: number;
  created_at: string;
}

interface TestResult {
  id: string;
  test_type: string;
  score: number;
  accuracy: number;
  time_taken: number;
  difficulty: string;
  category: string;
  questions_total: number;
  questions_correct: number;
  streak: number;
  created_at: string;
}

interface UserProfile {
  name: string;
  email: string;
  points: number;
  badges: string[];
  level: string;
  quiz_score: number;
  total_quizzes_taken: number;
  completed_courses: string[];
  created_at: string;
}

export function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'results'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, timeRange]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      if (timeRange === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }

      // Fetch activities
      let activityQuery = supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (timeRange !== 'all') {
        activityQuery = activityQuery.gte('created_at', startDate.toISOString());
      }

      const { data: activityData, error: activityError } = await activityQuery;
      
      if (activityError) throw activityError;

      setActivities(activityData || []);

      // Fetch test results
      let resultsQuery = supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (timeRange !== 'all') {
        resultsQuery = resultsQuery.gte('created_at', startDate.toISOString());
      }

      const { data: resultData, error: resultError } = await resultsQuery;
      
      if (resultError) throw resultError;

      setTestResults(resultData || []);

    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!testResults.length) return null;

    const totalScore = testResults.reduce((sum, result) => sum + result.score, 0);
    const avgScore = totalScore / testResults.length;
    const avgAccuracy = testResults.reduce((sum, result) => sum + result.accuracy, 0) / testResults.length;
    const bestStreak = Math.max(...testResults.map(result => result.streak));

    return {
      avgScore: Math.round(avgScore),
      avgAccuracy: Math.round(avgAccuracy),
      bestStreak,
      totalTests: testResults.length
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={fetchUserData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-red-600 to-purple-600 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{profile?.name}</h1>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">{profile?.email}</span>
                <span className={`font-medium ${
                  profile?.level === 'beginner' ? 'text-green-500' :
                  profile?.level === 'intermediate' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {profile?.level?.charAt(0).toUpperCase() + profile?.level?.slice(1)} Level
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-500">{profile?.points}</span>
            </div>
            <div className="mt-2">
              <h3 className="text-lg font-medium text-white">Total Points</h3>
              <p className="text-gray-400">Your accumulated score</p>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <Target className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-blue-500">{stats?.avgAccuracy}%</span>
            </div>
            <div className="mt-2">
              <h3 className="text-lg font-medium text-white">Average Accuracy</h3>
              <p className="text-gray-400">Test performance</p>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <Zap className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-green-500">{stats?.bestStreak}</span>
            </div>
            <div className="mt-2">
              <h3 className="text-lg font-medium text-white">Best Streak</h3>
              <p className="text-gray-400">Consecutive correct answers</p>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <Brain className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold text-purple-500">{stats?.totalTests}</span>
            </div>
            <div className="mt-2">
              <h3 className="text-lg font-medium text-white">Tests Completed</h3>
              <p className="text-gray-400">Total challenges taken</p>
            </div>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="flex justify-end mb-6">
          <div className="flex rounded-lg overflow-hidden border border-gray-800">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 ${
                timeRange === 'week'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 ${
                timeRange === 'month'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 ${
                timeRange === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'overview'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'activity'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'results'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Test Results
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid gap-8">
            {/* Progress Chart */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <TrendingUp className="w-6 h-6 text-blue-500 mr-2" />
                Progress Overview
              </h2>
              <div className="h-64 flex items-end justify-between space-x-2">
                {testResults.slice(-7).map((result, index) => (
                  <div key={index} className="flex-1">
                    <div 
                      className="bg-blue-500/50 hover:bg-blue-500/70 transition-colors rounded-t"
                      style={{ height: `${result.accuracy}%` }}
                    />
                    <div className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-top-left">
                      {new Date(result.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Medal className="w-6 h-6 text-yellow-500 mr-2" />
                Recent Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities
                  .filter(activity => activity.activity_type === 'achievement')
                  .slice(0, 6)
                  .map((achievement, index) => (
                    <div key={index} className="bg-gray-800/50 p-4 rounded-lg flex items-center space-x-3">
                      <Award className="w-8 h-8 text-yellow-500" />
                      <div>
                        <div className="font-medium text-white">{achievement.description}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(achievement.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Activity className="w-6 h-6 text-green-500 mr-2" />
              Activity History
            </h2>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {activity.activity_type === 'test' && <Brain className="w-5 h-5 text-blue-500" />}
                      {activity.activity_type === 'achievement' && <Trophy className="w-5 h-5 text-yellow-500" />}
                      {activity.activity_type === 'course' && <BookOpen className="w-5 h-5 text-green-500" />}
                      <div>
                        <div className="font-medium text-white">{activity.description}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(activity.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {activity.points_earned > 0 && (
                      <div className="text-yellow-500 flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        +{activity.points_earned}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <BarChart className="w-6 h-6 text-purple-500 mr-2" />
              Test Results
            </h2>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        result.difficulty === 'beginner' ? 'bg-green-900/30 text-green-500' :
                        result.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-500' :
                        'bg-red-900/30 text-red-500'
                      }`}>
                        <Brain className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{result.test_type}</div>
                        <div className="text-sm text-gray-400">{result.category}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(result.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Score</div>
                      <div className="text-xl font-bold text-yellow-500">{result.score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Accuracy</div>
                      <div className="text-xl font-bold text-green-500">{result.accuracy}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Time</div>
                      <div className="text-xl font-bold text-blue-500">{result.time_taken}s</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Streak</div>
                      <div className="text-xl font-bold text-purple-500">{result.streak}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">{result.questions_correct}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-400">{result.questions_total}</span>
                      <XCircle className="w-4 h-4 text-red-500 ml-2" />
                      <span className="text-red-500">
                        {result.questions_total - result.questions_correct}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}