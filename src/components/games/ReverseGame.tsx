import React, { useState, useEffect } from 'react';
import { Binary, Terminal, AlertTriangle, CheckCircle2, Code, Brain, Target, Trophy, Timer, RefreshCw } from 'lucide-react';
import { Howl } from 'howler';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
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
    id: 'strings-basic',
    title: 'Basic String Analysis',
    description: 'Find the hidden flag in this simple program',
    difficulty: 'beginner',
    points: 100,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
    timeLimit: 300,
    code: `
void main() {
  char flag[] = "flag{my_first_rev}";
  printf("Welcome to the game!");
}
    `,
    hint: 'Look for string literals in the code. The flag format is flag{...}',
    solution: 'flag{my_first_rev}',
    tutorial: `
# Basic String Analysis

When analyzing programs, one of the first things to look for are string literals - text that's directly embedded in the code.

Tips:
1. Look for strings between quotes
2. Check for common flag formats
3. Strings might be used in print statements
    `
  },
  {
    id: 'xor-basic',
    title: 'Simple XOR Encryption',
    description: 'The flag is encrypted with a simple XOR operation',
    difficulty: 'beginner',
    points: 150,
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    timeLimit: 420,
    code: `
char encrypted[] = {0x7B, 0x6C, 0x7D, 0x6E, 0x7F};
char key = 0x13;

void decrypt() {
  for(int i = 0; i < 5; i++) {
    printf("%c", encrypted[i] ^ key);
  }
}
    `,
    hint: 'XOR each byte with the key (0x13). XOR is its own inverse!',
    solution: 'hello',
    tutorial: `
# XOR Encryption

XOR is a common encryption technique:
- Each byte is XORed with a key
- To decrypt, XOR again with the same key
- XOR properties: a ^ b ^ b = a

Example:
0x7B ^ 0x13 = 'h'
0x6C ^ 0x13 = 'e'
And so on...
    `
  },
  {
    id: 'loop-analysis',
    title: 'Loop Analysis',
    description: 'Figure out what this loop does to reveal the flag',
    difficulty: 'intermediate',
    points: 200,
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
    timeLimit: 600,
    code: `
char input[] = "synt{erireg_vf_sha}";

void transform() {
  for(int i = 0; input[i]; i++) {
    if(input[i] >= 'a' && input[i] <= 'z') {
      input[i] = ((input[i] - 'a' + 13) % 26) + 'a';
    }
  }
  printf("%s\\n", input);
}
    `,
    hint: 'This is a ROT13 cipher. Each letter is rotated 13 positions in the alphabet.',
    solution: 'flag{ervers_is_fun}',
    tutorial: `
# ROT13 Cipher Analysis

ROT13 is a simple substitution cipher:
- Shifts each letter 13 positions
- a -> n, b -> o, etc.
- ROT13(ROT13(x)) = x

To solve:
1. Identify the pattern in the loop
2. Understand the modulo operation
3. Apply the same transformation
    `
  }
];

export function ReverseGame() {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [consoleHistory, setConsoleHistory] = useState<string[]>([]);
  const [showScenario, setShowScenario] = useState(true);
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
    setShowTutorial(false);
    setFeedback('');
    setConsoleHistory([]);
    addToConsole('start_analysis', 'Beginning binary analysis...');
  };

  const addToConsole = (command: string, output: string) => {
    setConsoleHistory(prev => [...prev, 
      `analyst@rev:~$ ${command}`,
      `[${new Date().toLocaleTimeString()}] ${output}`
    ]);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    sounds.keypress.play();
  };

  const endChallenge = async (success: boolean) => {
    setGameActive(false);
    
    if (success) {
      const challenge = challenges[currentChallenge];
      const timeBonus = Math.floor(timeLeft / 10);
      const comboBonus = combo * 50;
      const totalPoints = challenge.points + timeBonus + comboBonus;
      
      setScore(prev => prev + totalPoints);
      setCombo(prev => prev + 1);
      sounds.success.play();
      
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

      setFeedback(`Excellent work! +${totalPoints} points (Time Bonus: +${timeBonus}, Combo: x${combo + 1})`);
      addToConsole('verify_solution', 'Analysis successful! Flag extracted.');

      setTimeout(() => {
        if (currentChallenge < challenges.length - 1) {
          setCurrentChallenge(prev => prev + 1);
          setShowScenario(true);
          sounds.levelUp.play();
        } else {
          setFeedback('Congratulations! You\'ve completed all reverse engineering challenges!');
        }
      }, 2000);
    } else {
      sounds.error.play();
      setCombo(0);
      setFeedback('Analysis failed. Review your approach and try again.');
      addToConsole('verify_solution', 'Analysis inconclusive. Retrying with different approach...');
    }
  };

  const checkSolution = () => {
    const challenge = challenges[currentChallenge];
    const isCorrect = input.toLowerCase() === challenge.solution.toLowerCase();

    if (isCorrect) {
      endChallenge(true);
    } else {
      endChallenge(false);
    }
  };

  const challenge = challenges[currentChallenge];

  return (
    <div className="max-w-7xl mx-auto bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800">
      {showScenario ? (
        <div className="text-center">
          <div className="relative mb-8 rounded-lg overflow-hidden">
            <img 
              src={challenge.image} 
              alt="Challenge Scenario"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
              <Binary className="w-12 h-12 text-green-500 mr-4" />
              <div className="text-left">
                <h2 className="text-2xl font-bold text-white mb-2">{challenge.title}</h2>
                <p className="text-gray-300">{challenge.description}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-black/50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Challenge Details</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Difficulty:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    challenge.difficulty === 'beginner' ? 'bg-green-900 text-green-200' :
                    challenge.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-200' :
                    'bg-red-900 text-red-200'
                  }`}>
                    {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Points:</span>
                  <span className="text-yellow-500">{challenge.points}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Time Limit:</span>
                  <span className="text-blue-500">{formatTime(challenge.timeLimit)}</span>
                </div>
              </div>
            </div>
            <div className="bg-black/50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Required Skills</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-300">
                  <Brain className="w-5 h-5 text-green-500 mr-2" />
                  Basic programming knowledge
                </li>
                <li className="flex items-center text-gray-300">
                  <Terminal className="w-5 h-5 text-green-500 mr-2" />
                  Understanding of assembly/binary
                </li>
                <li className="flex items-center text-gray-300">
                  <Target className="w-5 h-5 text-green-500 mr-2" />
                  Problem-solving skills
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={startChallenge}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors transform hover:scale-105"
          >
            Start Analysis
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                challenge.difficulty === 'beginner' ? 'bg-green-900 text-green-200' :
                challenge.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-200' :
                'bg-red-900 text-red-200'
              }`}>
                {challenge.difficulty.toUpperCase()}
              </span>
              <div className="flex items-center space-x-4">
                <span className="text-yellow-500">{challenge.points} pts</span>
                <span className={`flex items-center ${
                  timeLeft < 60 ? 'text-red-500' : 'text-blue-500'
                }`}>
                  <Timer className="w-4 h-4 mr-1" />
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className="bg-[#1E1E1E] rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="flex items-center">
                  <Code className="w-4 h-4 mr-2" />
                  Binary Analysis
                </span>
              </div>
              <SyntaxHighlighter
                language="cpp"
                style={atomOneDark}
                customStyle={{
                  background: 'transparent',
                  padding: '1rem',
                  margin: 0,
                  borderRadius: '0.5rem'
                }}
              >
                {challenge.code}
              </SyntaxHighlighter>
            </div>

            <div className="mb-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <textarea
                  value={input}
                  onChange={handleInput}
                  className="w-full bg-gray-900 text-green-500 p-4 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={4}
                  placeholder="Enter your solution..."
                />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <button
                onClick={checkSolution}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Terminal className="w-5 h-5 mr-2" />
                Submit Solution
              </button>
              <button
                onClick={() => setShowHint(!showHint)}
                className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowTutorial(!showTutorial)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showTutorial ? 'Hide Tutorial' : 'Show Tutorial'}
              </button>
            </div>

            {showHint && (
              <div className="mt-4 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <div className="flex items-center text-blue-400 mb-2">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Analysis Hint:</span>
                </div>
                <p className="text-blue-300">{challenge.hint}</p>
              </div>
            )}

            {showTutorial && (
              <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="prose prose-invert max-w-none">
                  <pre className="text-gray-300 whitespace-pre-wrap">
                    {challenge.tutorial}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="bg-[#1E1E1E] rounded-lg p-4 h-[600px] overflow-y-auto font-mono">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="flex items-center">
                  <Terminal className="w-4 h-4 mr-2" />
                  Analysis Console
                </span>
              </div>
              <div className="text-green-500">
                {consoleHistory.map((line, index) => (
                  <div key={index} className={line.startsWith('analyst@rev') ? 'text-blue-400' : 'text-gray-400'}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-gray-400">
            Challenge {currentChallenge + 1}/{challenges.length}
          </div>
          {combo > 1 && (
            <div className="text-yellow-500 flex items-center">
              <Trophy className="w-4 h-4 mr-1" />
              Combo x{combo}
            </div>
          )}
        </div>
        <div className="text-green-500 font-bold text-xl">
          Score: {score}
        </div>
      </div>

      {feedback && (
        <div className={`mt-4 p-4 rounded-lg flex items-center ${
          feedback.includes('Excellent') ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'
        }`}>
          {feedback.includes('Excellent') ? (
            <CheckCircle2 className="w-5 h-5 mr-2" />
          ) : (
            <AlertTriangle className="w-5 h-5 mr-2" />
          )}
          {feedback}
        </div>
      )}
    </div>
  );
}