export type Theme = 'dark' | 'light';

export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  badges: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  completedCourses: string[];
  quizScore: number;
  totalQuizzesTaken: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  points: number;
  modules: string[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  category: string;
  solved: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

export interface Lab {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  tools: string[];
  category: string;
}