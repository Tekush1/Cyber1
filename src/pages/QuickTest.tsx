import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Timer, 
  Trophy, 
  Star, 
  Target, 
  AlertCircle, 
  Book, 
  Zap, 
  Award,
  BarChart,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Medal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { getRandomQuestions, getQuestionsByCategory, getQuestionsByDifficulty } from '../data/questions';
import type { QuizQuestion } from '../types';

interface QuizStats {
  correctAnswers: number;
  incorrectAnswers: number;
  streak: number;
  bestStreak: number;
  averageTime: number;
}

export function QuickTest() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [quizStarted, setQuizStarted] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [stats, setStats] = useState<QuizStats>({
    correctAnswers: 0,
    incorrectAnswers: 0,
    streak: 0,
    bestStreak: 0,
    averageTime: 0
  });
  const [showExplanation, setShowExplanation] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);

  useEffect(() => {
    let selectedQuestions: QuizQuestion[];
    
    if (category !== 'all' && difficulty !== 'all') {
      selectedQuestions = questionBank
        .filter(q => q.category === category && q.difficulty === difficulty);
    } else if (category !== 'all') {
      selectedQuestions = getQuestionsByCategory(category);
    } else if (difficulty !== 'all') {
      selectedQuestions = getQuestionsByDifficulty(difficulty);
    } else {
      selectedQuestions = getRandomQuestions();
    }
    
    const shuffled = selectedQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, 15);
    
    setQuestions(shuffled);
  }, [category, difficulty]);

  useEffect(() => {
    let timer: number;
    if (quizStarted && timeLeft > 0 && !showResults) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
        setQuestionTimer(prev => prev + 1);
      }, 1000);
    } else if (timeLeft === 0 && !showResults) {
      endQuiz();
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, showResults]);

  const checkAchievements = () => {
    const newAchievements: string[] = [];

    if (score === questions.length * 10) {
      newAchievements.push('Perfect Score! 🏆');
    }

    if (stats.averageTime < 5) {
      newAchievements.push('Speed Demon! ⚡');
    }

    if (stats.bestStreak >= 5) {
      newAchievements.push('Streak Master! 🔥');
    }

    if (stats.correctAnswers >= 10) {
      newAchievements.push('Knowledge Master! 🎓');
    }

    if (timeLeft > 120) {
      newAchievements.push('Time Lord! ⌛');
    }

    setAchievements(newAchievements);
    return newAchievements;
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(180);
    setScore(0);
    setCurrentQuestion(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setFeedback(null);
    setStats({
      correctAnswers: 0,
      incorrectAnswers: 0,
      streak: 0,
      bestStreak: 0,
      averageTime: 0
    });
    setQuestionTimer(0);
    setAnsweredQuestions([]);
  };

  const handleAnswer = async (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === questions[currentQuestion].correctAnswer;
    
    const newStats = { ...stats };
    if (correct) {
      newStats.correctAnswers++;
      newStats.streak++;
      newStats.bestStreak = Math.max(newStats.streak, newStats.bestStreak);
      setScore(prev => prev + 10);
      setFeedback({
        correct: true,
        message: 'Correct! ' + getEncouragingMessage()
      });
    } else {
      newStats.incorrectAnswers++;
      newStats.streak = 0;
      setFeedback({
        correct: false,
        message: 'Incorrect. Keep learning!'
      });
    }

    newStats.averageTime = (newStats.averageTime * currentQuestion + questionTimer) / (currentQuestion + 1);
    setStats(newStats);
    setShowExplanation(true);

    // Add question ID to answered questions
    setAnsweredQuestions([...answeredQuestions, questions[currentQuestion].id]);

    // Update progress in database after each answer
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            answered_questions: [...answeredQuestions, questions[currentQuestion].id]
          })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error updating answered questions:', error);
    }

    setTimeout(() => {
      setFeedback(null);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setQuestionTimer(0);
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        endQuiz();
      }
    }, 2000);
  };

  const getEncouragingMessage = () => {
    const messages = [
      "Great work! 🌟",
      "You're on fire! 🔥",
      "Keep it up! 💪",
      "Brilliant! 🎯",
      "Outstanding! 🏆"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const endQuiz = async () => {
    setShowResults(true);
    setQuizStarted(false);
    const earnedAchievements = checkAchievements();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Calculate percentage score
        const percentageScore = Math.round((stats.correctAnswers / questions.length) * 100);
        
        // Update quiz history
        await supabase
          .from('quiz_history')
          .insert({
            user_id: user.id,
            score: percentageScore,
            questions_answered: questions.length,
            correct_answers: stats.correctAnswers,
            time_taken: 180 - timeLeft,
            category: category === 'all' ? 'general' : category,
            difficulty: difficulty === 'all' ? 'mixed' : difficulty,
            best_streak: stats.bestStreak
          });

        // Update user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('quiz_score, total_quizzes_taken, points')
          .eq('id', user.id)
          .single();

        if (profile) {
          const totalQuizzes = profile.total_quizzes_taken + 1;
          const previousScoreTotal = profile.quiz_score * profile.total_quizzes_taken;
          const newAverageScore = Math.round((previousScoreTotal + percentageScore) / totalQuizzes);
          
          await supabase
            .from('profiles')
            .update({
              quiz_score: newAverageScore,
              total_quizzes_taken: totalQuizzes,
              points: profile.points + score,
              level: score > 80 ? 'advanced' : score > 50 ? 'intermediate' : 'beginner'
            })
            .eq('id', user.id);
        }

        // Record achievements
        if (earnedAchievements.length > 0) {
          await supabase
            .from('user_activity')
            .insert(
              earnedAchievements.map(achievement => ({
                user_id: user.id,
                activity_type: 'achievement',
                description: achievement,
                points_earned: 50,
                metadata: {
                  quiz_score: percentageScore,
                  best_streak: stats.bestStreak
                }
              }))
            );
        }

        // Update user progress
        await supabase
          .from('user_progress')
          .upsert({
            user_id: user.id,
            total_quizzes_completed: profile?.total_quizzes_taken + 1,
            highest_score: Math.max(profile?.quiz_score || 0, percentageScore),
            best_streak: Math.max(profile?.best_streak || 0, stats.bestStreak),
            last_activity_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error updating quiz results:', error);
    }
  };

  const getProgressColor = () => {
    const progress = (currentQuestion + 1) / questions.length;
    if (progress < 0.33) return 'bg-red-500';
    if (progress < 0.66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {!quizStarted && !showResults ? (
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-red-500 to-white">
              Cybersecurity Knowledge Test
            </h1>
            <p className="text-gray-400 mb-8">
              Test your cybersecurity knowledge and earn achievements!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="Network Security">Network Security</option>
                  <option value="Web Security">Web Security</option>
                  <option value="Cryptography">Cryptography</option>
                  <option value="Application Security">Application Security</option>
                  <option value="Cloud Security">Cloud Security</option>
                  <option value="Mobile Security">Mobile Security</option>
                  <option value="IoT Security">IoT Security</option>
                  <option value="Malware Analysis">Malware Analysis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white"
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Quiz Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Timer className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">3 Minutes</p>
                </div>
                <div className="text-center">
                  <Book className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">15 Questions</p>
                </div>
                <div className="text-center">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Achievements</p>
                </div>
                <div className="text-center">
                  <BarChart className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Detailed Stats</p>
                </div>
              </div>
            </div>

            <button
              onClick={startQuiz}
              className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors transform hover:scale-105"
            >
              Start Quiz
            </button>
          </div>
        ) : showResults ? (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800">
            <div className="text-center mb-8">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
              <p className="text-gray-400">
                You scored {score} out of {questions.length * 10} points
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-400 mb-1">Accuracy</div>
                <div className="text-2xl font-bold text-green-500">
                  {Math.round((stats.correctAnswers / questions.length) * 100)}%
                </div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-400 mb-1">Best Streak</div>
                <div className="text-2xl font-bold text-blue-500">
                  {stats.bestStreak}
                </div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-400 mb-1">Avg. Time</div>
                <div className="text-2xl font-bold text-purple-500">
                  {Math.round(stats.averageTime)}s
                </div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-400 mb-1">Time Left</div>
                <div className="text-2xl font-bold text-yellow-500">
                  {timeLeft}s
                </div>
              </div>
            </div>

            {achievements.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-center">Achievements Unlocked!</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="bg-yellow-900/30 text-yellow-200 px-4 py-2 rounded-lg flex items-center gap-2 animate-fadeIn"
                    >
                      <Medal className="w-5 h-5" />
                      <span>{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={startQuiz}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </button>
              <button
                onClick={() => navigate('/leaderboard')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Trophy className="w-5 h-5 mr-2" />
                View Rankings
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800">
            <div className="flex justify-between items-center mb-8">
              <div className="text-xl font-bold">
                Question {currentQuestion + 1}/{questions.length}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-yellow-500">
                  <Star className="w-5 h-5 mr-2" />
                  <span>{score} pts</span>
                </div>
                <div className="flex items-center text-blue-500">
                  <Timer className="w-5 h-5 mr-2" />
                  <span>{timeLeft}s</span>
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-800 rounded-full h-2 mb-8">
              <div
                className={`${getProgressColor()} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>

            <div className="mb-8">
              <div className="flex items-center mb-2">
                <span className={`px-2 py-1 rounded-full text-xs mr-2 ${
                  questions[currentQuestion]?.difficulty === 'easy' ? 'bg-green-900 text-green-200' :
                  questions[currentQuestion]?.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-red-900 text-red-200'
                }`}>
                  {questions[currentQuestion]?.difficulty.toUpperCase()}
                </span>
                <span className="text-gray-400">{questions[currentQuestion]?.category}</span>
              </div>
              
              <h2 className="text-xl font-semibold mb-6">
                {questions[currentQuestion]?.question}
              </h2>

              <div className="space-y-4">
                {questions[currentQuestion]?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full text-left p-4 rounded-lg transition-colors ${
                      selectedAnswer === null
                        ? 'bg-gray-800 hover:bg-gray-700'
                        : selectedAnswer === index
                        ? questions[currentQuestion].correctAnswer === index
                          ? 'bg-green-600'
                          : 'bg-red-600'
                        : questions[currentQuestion].correctAnswer === index && selectedAnswer !== null
                        ? 'bg-green-600'
                        : 'bg-gray-800'
                    } relative overflow-hidden group`}
                  >
                    <div className="flex items-center">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-600 mr-3">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </div>
                    {selectedAnswer === index && (
                      <div className="absolute inset-y-0 right-4 flex items-center">
                        {index === questions[currentQuestion].correctAnswer ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <XCircle className="w-6 h-6 text-white" />
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {showExplanation && questions[currentQuestion].explanation && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center text-blue-400 mb-2">
                  <Book className="w-5 h-5 mr-2" />
                  <span className="font-medium">Explanation:</span>
                </div>
                <p className="text-gray-300">
                  {questions[currentQuestion].explanation}
                </p>
              </div>
            )}

            {feedback && (
              <div className={`mt-4 p-4 rounded-lg text-center ${
                feedback.correct ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'
              }`}>
                {feedback.correct ? (
                  <Sparkles className="w-5 h-5 inline-block mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 inline-block mr-2" />
                )}
                {feedback.message}
              </div>
            )}

            <div className="flex justify-between items-center mt-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Zap className="w-5 h-5 text-yellow-500 mr-1" />
                  <span className="text-yellow-500">Streak: {stats.streak}</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-5 h-5 text-purple-500 mr-1" />
                  <span className="text-purple-500">Best: {stats.bestStreak}</span>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                Question Time: {questionTimer}s
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}