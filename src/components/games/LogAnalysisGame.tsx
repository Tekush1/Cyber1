import React, { useState, useEffect } from 'react';
import { Search, Terminal, AlertTriangle, CheckCircle2, FileText, Clock, Target, Brain, Shield } from 'lucide-react';
import { Howl } from 'howler';
import { supabase } from '../../lib/supabaseClient';

// Sound effects
const sounds = {
  keypress: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'] }),
  success: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'] }),
  error: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'] }),
  levelUp: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3'] })
};

const challenges = [
  {
    id: 'ssh-bruteforce',
    title: 'SSH Brute Force Attack',
    description: 'Analyze SSH logs to identify a brute force attack attempt',
    difficulty: 'beginner',
    points: 100,
    timeLimit: 300,
    logs: [
      'Jan 15 08:23:01 server sshd[12345]: Failed password for root from 192.168.1.100 port 54321',
      'Jan 15 08:23:03 server sshd[12346]: Failed password for root from 192.168.1.100 port 54322',
      'Jan 15 08:23:05 server sshd[12347]: Failed password for root from 192.168.1.100 port 54323',
      'Jan 15 08:23:07 server sshd[12348]: Failed password for root from 192.168.1.100 port 54324',
      'Jan 15 08:23:09 server sshd[12349]: Successful login for root from 192.168.1.100 port 54325',
      'Jan 15 08:24:01 server sshd[12350]: New session opened for root from 192.168.1.100'
    ],
    questions: [
      {
        question: 'What is the attacking IP address?',
        answer: '192.168.1.100'
      },
      {
        question: 'How many failed login attempts were there?',
        answer: '4'
      },
      {
        question: 'Did the attacker eventually succeed?',
        answer: 'yes'
      }
    ],
    hints: [
      'Look for patterns in failed login attempts',
      'Check the timestamps between attempts',
      'Notice the transition from failed to successful logins'
    ]
  },
  {
    id: 'web-attack',
    title: 'Web Server Attack',
    description: 'Identify a SQL injection attempt in web server logs',
    difficulty: 'intermediate',
    points: 200,
    timeLimit: 420,
    logs: [
      '192.168.1.50 - - [15/Jan/2024:10:15:01 -0500] "GET /login.php HTTP/1.1" 200 1234',
      '192.168.1.50 - - [15/Jan/2024:10:15:05 -0500] "POST /login.php?username=admin\'--&password=anything HTTP/1.1" 403 789',
      '192.168.1.50 - - [15/Jan/2024:10:15:08 -0500] "GET /admin.php HTTP/1.1" 403 567',
      '192.168.1.50 - - [15/Jan/2024:10:15:12 -0500] "POST /login.php?username=admin\' OR \'1\'=\'1&password=test HTTP/1.1" 403 789',
      '192.168.1.51 - - [15/Jan/2024:10:16:01 -0500] "GET /index.php HTTP/1.1" 200 2345',
      '192.168.1.50 - - [15/Jan/2024:10:16:15 -0500] "GET /phpinfo.php HTTP/1.1" 404 234'
    ],
    questions: [
      {
        question: 'What type of attack is being attempted?',
        answer: 'sql injection'
      },
      {
        question: 'What page is the attacker targeting?',
        answer: 'login.php'
      },
      {
        question: 'Is the attacker trying to access sensitive information?',
        answer: 'yes'
      }
    ],
    hints: [
      'Look for special SQL characters in URLs',
      'Check for attempts to bypass authentication',
      'Notice patterns in failed requests'
    ]
  },
  {
    id: 'malware-activity',
    title: 'Malware Activity Detection',
    description: 'Analyze system logs to identify malware behavior',
    difficulty: 'advanced',
    points: 300,
    timeLimit: 600,
    logs: [
      'Jan 15 12:00:01 server process[1234]: New process created: svchost.exe',
      'Jan 15 12:00:02 server network[5678]: Connection established to 185.128.43.21:443',
      'Jan 15 12:00:03 server file[9012]: File created: C:\\Windows\\System32\\temp\\xyz.dll',
      'Jan 15 12:00:04 server registry[3456]: Registry key modified: HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
      'Jan 15 12:00:05 server process[1234]: Process attempting to modify system files',
      'Jan 15 12:00:06 server network[5678]: Large data transfer to external IP: 185.128.43.21',
      'Jan 15 12:00:07 server security[7890]: Antivirus detection: Trojan.Generic.123'
    ],
    questions: [
      {
        question: 'What is the suspicious IP address?',
        answer: '185.128.43.21'
      },
      {
        question: 'What type of malware was detected?',
        answer: 'trojan'
      },
      {
        question: 'Is data exfiltration occurring?',
        answer: 'yes'
      }
    ],
    hints: [
      'Look for suspicious network connections',
      'Check for system modifications',
      'Identify unusual process behavior'
    ]
  }
];

export function LogAnalysisGame() {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [showScenario, setShowScenario] = useState(true);
  const [highlightedLogs, setHighlightedLogs] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    let timer: number;
    if (gameActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      endChallenge(false);
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startChallenge = () => {
    setGameActive(true);
    setTimeLeft(challenges[currentChallenge].timeLimit);
    setShowScenario(false);
    setInput('');
    setShowHint(false);
    setFeedback('');
    setCurrentQuestion(0);
    setHighlightedLogs([]);
    setSearchTerm('');
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    sounds.keypress.play();
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const highlighted = challenges[currentChallenge].logs
      .map((log, index) => log.toLowerCase().includes(term.toLowerCase()) ? index : -1)
      .filter(index => index !== -1);
    setHighlightedLogs(highlighted);
  };

  const checkAnswer = async () => {
    const challenge = challenges[currentChallenge];
    const question = challenge.questions[currentQuestion];
    const isCorrect = input.toLowerCase() === question.answer.toLowerCase();

    if (isCorrect) {
      sounds.success.play();
      const timeBonus = Math.floor(timeLeft / 10);
      const comboBonus = combo * 25;
      const questionPoints = Math.floor(challenge.points / challenge.questions.length);
      const totalPoints = questionPoints + timeBonus + comboBonus;
      
      setScore(prev => prev + totalPoints);
      setCombo(prev => prev + 1);
      setFeedback(`Correct! +${totalPoints} points (Time Bonus: +${timeBonus}, Combo: x${combo + 1})`);

      if (currentQuestion < challenge.questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1);
          setInput('');
          setFeedback('');
        }, 1500);
      } else {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('profiles')
              .update({ 
                points: score + totalPoints,
                level: score > 800 ? 'advanced' : score > 400 ? 'intermediate' : 'beginner'
              })
              .eq('id', user.id);
          }
        } catch (error) {
          console.error('Error updating score:', error);
        }

        setTimeout(() => {
          if (currentChallenge < challenges.length - 1) {
            setCurrentChallenge(prev => prev + 1);
            setShowScenario(true);
            sounds.levelUp.play();
          } else {
            setFeedback('Congratulations! You\'ve completed all challenges!');
          }
        }, 1500);
      }
    } else {
      sounds.error.play();
      setCombo(0);
      setFeedback('Incorrect. Try analyzing the logs more carefully.');
    }
  };

  const endChallenge = (success: boolean) => {
    setGameActive(false);
    if (!success) {
      setFeedback('Time\'s up! Try again.');
      setCombo(0);
    }
  };

  const challenge = challenges[currentChallenge];

  return (
    <div className="max-w-7xl mx-auto bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800">
      {showScenario ? (
        <div className="text-center">
          <div className="mb-8">
            <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{challenge.title}</h2>
            <p className="text-gray-400">{challenge.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800/50 p-6 rounded-lg">
              <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-lg font-bold">{formatTime(challenge.timeLimit)}</div>
              <div className="text-sm text-gray-400">Time Limit</div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg">
              <Target className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-lg font-bold">{challenge.points}</div>
              <div className="text-sm text-gray-400">Points</div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg">
              <Brain className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-lg font-bold">{challenge.questions.length}</div>
              <div className="text-sm text-gray-400">Questions</div>
            </div>
          </div>

          <button
            onClick={startChallenge}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
          >
            Start Analysis
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                challenge.difficulty === 'beginner' ? 'bg-green-900 text-green-200' :
                challenge.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-200' :
                'bg-red-900 text-red-200'
              }`}>
                {challenge.difficulty.toUpperCase()}
              </span>
              <span className="text-gray-400">
                Question {currentQuestion + 1} of {challenge.questions.length}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-yellow-500">{score} pts</div>
              <div className={`${
                timeLeft < 60 ? 'text-red-500' : 'text-blue-500'
              }`}>{formatTime(timeLeft)}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">System Logs</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 pr-4 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="bg-black rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto">
              {challenge.logs.map((log, index) => (
                <div
                  key={index}
                  className={`py-1 ${
                    highlightedLogs.includes(index)
                      ? 'bg-yellow-500/20 px-2 rounded'
                      : ''
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">
              {challenge.questions[currentQuestion].question}
            </h3>
            <div className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={handleInput}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your answer..."
                onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
              />
              <button
                onClick={checkAnswer}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Terminal className="w-5 h-5 mr-2" />
                Submit
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-gray-400 hover:text-white transition-colors flex items-center"
            >
              <Brain className="w-5 h-5 mr-2" />
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            {combo > 1 && (
              <div className="text-yellow-500 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Combo x{combo}
              </div>
            )}
          </div>

          {showHint && (
            <div className="mt-4 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <div className="flex items-center text-blue-400 mb-2">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span className="font-medium">Hint:</span>
              </div>
              <p className="text-blue-300">{challenge.hints[currentQuestion]}</p>
            </div>
          )}

          {feedback && (
            <div className={`mt-4 p-4 rounded-lg flex items-center ${
              feedback.includes('Correct') ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'
            }`}>
              {feedback.includes('Correct') ? (
                <CheckCircle2 className="w-5 h-5 mr-2" />
              ) : (
                <AlertTriangle className="w-5 h-5 mr-2" />
              )}
              {feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}