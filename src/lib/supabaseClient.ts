import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.');
}

// Initialize the Supabase client with TypeScript types
export const supabase = createClient<Database>(
  supabaseUrl || 'https://your-project.supabase.co',
  supabaseAnonKey || 'your-anon-key'
);

// Authentication state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
    await ensureUserProfile(session.user);
  }
});

/**
 * Creates or updates a user profile and progress in the database
 * This function is called automatically when a user signs up or signs in
 */
async function ensureUserProfile(user: any) {
  try {
    // Start a transaction
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select()
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    // If profile doesn't exist, create it
    if (!profile) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || 'Anonymous Hacker',
          points: 0,
          badges: [],
          level: 'beginner',
          quiz_score: 0,
          total_quizzes_taken: 0,
          completed_courses: [],
          notifications: {
            email: true,
            quiz: true,
            achievements: true,
            security: true
          },
          privacy: {
            showProfile: true,
            showActivity: true,
            showStats: true
          }
        });

      if (insertError) {
        throw insertError;
      }

      // Initialize user progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          total_games_played: 0,
          total_courses_completed: 0,
          total_quizzes_completed: 0,
          total_time_spent: 0,
          highest_score: 0,
          current_streak: 0,
          best_streak: 0
        });

      if (progressError) {
        throw progressError;
      }
    }
  } catch (err) {
    console.error('Error in ensureUserProfile:', err);
  }
}

/**
 * Updates user progress after completing a game
 */
export async function updateGameProgress(userId: string, gameData: {
  gameType: string;
  score: number;
  duration: number;
  difficulty: string;
  metadata?: any;
}) {
  try {
    // Insert game history
    const { error: historyError } = await supabase
      .from('game_history')
      .insert({
        user_id: userId,
        game_type: gameData.gameType,
        score: gameData.score,
        duration: gameData.duration,
        difficulty: gameData.difficulty,
        metadata: gameData.metadata
      });

    if (historyError) throw historyError;

    // Update user progress
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (progressError) throw progressError;

    const { error: updateError } = await supabase
      .from('user_progress')
      .update({
        total_games_played: (progress?.total_games_played || 0) + 1,
        total_time_spent: (progress?.total_time_spent || 0) + Math.floor(gameData.duration / 60),
        highest_score: Math.max(progress?.highest_score || 0, gameData.score),
        last_activity_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Record activity
    await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        activity_type: 'game',
        description: `Completed ${gameData.gameType} game with score ${gameData.score}`,
        points_earned: gameData.score,
        metadata: gameData
      });

  } catch (err) {
    console.error('Error updating game progress:', err);
    throw err;
  }
}

/**
 * Updates user progress after completing a quiz
 */
export async function updateQuizProgress(userId: string, quizData: {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  timeTaken: number;
  category: string;
  difficulty: string;
  achievements?: string[];
  answeredQuestions?: string[];
}) {
  try {
    // Insert quiz history
    const { error: historyError } = await supabase
      .from('quiz_history')
      .insert({
        user_id: userId,
        score: quizData.score,
        questions_answered: quizData.questionsAnswered,
        correct_answers: quizData.correctAnswers,
        time_taken: quizData.timeTaken,
        category: quizData.category,
        difficulty: quizData.difficulty
      });

    if (historyError) throw historyError;

    // Update user progress
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (progressError) throw progressError;

    const { error: updateError } = await supabase
      .from('user_progress')
      .update({
        total_quizzes_completed: (progress?.total_quizzes_completed || 0) + 1,
        last_activity_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Record activity and achievements
    const activities = [];

    // Add quiz completion activity
    activities.push({
      user_id: userId,
      activity_type: 'quiz',
      description: `Completed ${quizData.category} quiz with score ${quizData.score}%`,
      points_earned: quizData.score,
      metadata: {
        category: quizData.category,
        difficulty: quizData.difficulty,
        correct_answers: quizData.correctAnswers,
        questions_answered: quizData.questionsAnswered
      }
    });

    // Add achievement activities
    if (quizData.achievements?.length) {
      quizData.achievements.forEach(achievement =>
        activities.push({
          user_id: userId,
          activity_type: 'achievement',
          description: achievement,
          points_earned: 50,
          metadata: {
            quiz_score: quizData.score,
            category: quizData.category
          }
        })
      );
    }

    // Record all activities
    await supabase
      .from('user_activity')
      .insert(activities);

    // Update answered questions in profile
    if (quizData.answeredQuestions?.length) {
      await supabase
        .from('profiles')
        .update({
          answered_questions: quizData.answeredQuestions
        })
        .eq('id', userId);
    }

  } catch (err) {
    console.error('Error updating quiz progress:', err);
    throw err;
  }
}

/**
 * Updates user progress after completing a course or roadmap item
 */
export async function updateRoadmapProgress(userId: string, itemData: {
  itemId: string;
  itemName: string;
  category: string;
  points: number;
}) {
  try {
    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('completed_courses')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const completedCourses = profile?.completed_courses || [];
    
    // Only update if not already completed
    if (!completedCourses.includes(itemData.itemId)) {
      // Update completed courses
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          completed_courses: [...completedCourses, itemData.itemId],
          points: profile?.points + itemData.points
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Record activity
      await supabase
        .from('user_activity')
        .insert({
          user_id: userId,
          activity_type: 'roadmap',
          description: `Completed ${itemData.itemName} in ${itemData.category}`,
          points_earned: itemData.points,
          metadata: itemData
        });

      // Update user progress
      await supabase
        .from('user_progress')
        .update({
          total_courses_completed: (profile?.completed_courses?.length || 0) + 1,
          last_activity_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    }
  } catch (err) {
    console.error('Error updating roadmap progress:', err);
    throw err;
  }
}

/**
 * Fetches user statistics and progress
 */
export async function fetchUserStats(userId: string) {
  try {
    const [
      { data: progress },
      { data: gameHistory },
      { data: quizHistory },
      { data: profile },
      { data: activities }
    ] = await Promise.all([
      supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('game_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('quiz_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
    ]);

    // Calculate additional stats
    const stats = {
      totalPoints: profile?.points || 0,
      completedCourses: profile?.completed_courses?.length || 0,
      quizAverage: quizHistory?.reduce((acc, quiz) => acc + quiz.score, 0) / (quizHistory?.length || 1),
      bestStreak: Math.max(...(quizHistory?.map(q => q.best_streak) || [0])),
      totalActivities: activities?.length || 0,
      recentAchievements: activities?.filter(a => a.points_earned > 0).slice(0, 5) || [],
      progress,
      gameHistory,
      quizHistory,
      profile,
      activities
    };

    return stats;
  } catch (err) {
    console.error('Error fetching user stats:', err);
    throw err;
  }
}