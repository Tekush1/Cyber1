export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          points: number;
          badges: string[];
          level: 'beginner' | 'intermediate' | 'advanced';
          quiz_score: number;
          total_quizzes_taken: number;
          completed_courses: string[];
          created_at: string;
          updated_at: string;
          notifications: {
            email: boolean;
            quiz: boolean;
            achievements: boolean;
            security: boolean;
          };
          privacy: {
            showProfile: boolean;
            showActivity: boolean;
            showStats: boolean;
          };
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          points?: number;
          badges?: string[];
          level?: 'beginner' | 'intermediate' | 'advanced';
          quiz_score?: number;
          total_quizzes_taken?: number;
          completed_courses?: string[];
          created_at?: string;
          updated_at?: string;
          notifications?: {
            email: boolean;
            quiz: boolean;
            achievements: boolean;
            security: boolean;
          };
          privacy?: {
            showProfile: boolean;
            showActivity: boolean;
            showStats: boolean;
          };
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          points?: number;
          badges?: string[];
          level?: 'beginner' | 'intermediate' | 'advanced';
          quiz_score?: number;
          total_quizzes_taken?: number;
          completed_courses?: string[];
          created_at?: string;
          updated_at?: string;
          notifications?: {
            email: boolean;
            quiz: boolean;
            achievements: boolean;
            security: boolean;
          };
          privacy?: {
            showProfile: boolean;
            showActivity: boolean;
            showStats: boolean;
          };
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          total_games_played: number;
          total_courses_completed: number;
          total_quizzes_completed: number;
          total_time_spent: number;
          highest_score: number;
          current_streak: number;
          best_streak: number;
          last_activity_at: string;
          created_at: string;
          updated_at: string;
        };
      };
      user_activity: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          description: string;
          points_earned: number;
          metadata: any;
          created_at: string;
        };
      };
      quiz_history: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          questions_answered: number;
          correct_answers: number;
          time_taken: number;
          category: string;
          difficulty: string;
          best_streak: number;
          created_at: string;
        };
      };
      game_history: {
        Row: {
          id: string;
          user_id: string;
          game_type: string;
          score: number;
          duration: number;
          difficulty: string;
          completed: boolean;
          metadata: any;
          created_at: string;
        };
      };
    };
  };
}