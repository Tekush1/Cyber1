import React, { useState, useEffect } from 'react';
import { Key, Lock, Unlock, RefreshCw, Timer, Brain, Shield, AlertTriangle, CheckCircle2, Copy, Terminal } from 'lucide-react';
import { Howl } from 'howler';
import { supabase } from '../../lib/supabaseClient';

// Sound effects
const sounds = {
  keypress: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'] }),
  success: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'] }),
  error: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'] }),
  levelUp: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3'] })
};

const cipherChallenges = [
  // Beginner Level
  {
    plaintext: "HELLO",
    hint: "Caesar Cipher - Shift each letter 3 positions to the right in the alphabet",
    encrypted: "KHOOR",
    difficulty: "beginner",
    points: 100,
    timeLimit: 120,
    category: "Classical Ciphers",
    description: "Learn the basics of letter substitution with the Caesar Cipher",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    tutorial: `
# Caesar Cipher Tutorial
The Caesar Cipher shifts each letter in the alphabet by a fixed number of positions.

Example:
- Shift of 3
- A → D
- B → E
- C → F
...and so on

Try it yourself:
1. Take each letter
2. Count 3 positions to the right in the alphabet
3. Write down the new letter
    `,
    technique: "Count backwards 3 positions in the alphabet for each letter"
  },
  {
    plaintext: "CYBER",
    hint: "Reverse the text - Read it backwards",
    encrypted: "REBYC",
    difficulty: "beginner",
    points: 150,
    timeLimit: 90,
    category: "Basic Transformations",
    description: "Master text reversal techniques",
    image: "https://images.unsplash.com/photo-1526374870839-e155464bb9b2",
    tutorial: `
# Text Reversal
The simplest form of text transformation.

Steps:
1. Start from the last letter
2. Read backwards
3. Write each letter in reverse order

Example:
HELLO → OLLEH
    `,
    technique: "Read the text from right to left"
  },
  // Intermediate Level
  {
    plaintext: "ATTACK",
    hint: "Atbash Cipher - Replace each letter with its opposite position in the alphabet (A→Z, B→Y, etc.)",
    encrypted: "ZGGZXP",
    difficulty: "intermediate",
    points: 200,
    timeLimit: 180,
    category: "Substitution Ciphers",
    description: "Learn alphabet substitution with the Atbash Cipher",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    tutorial: `
# Atbash Cipher
Letters are replaced with their opposite position in the alphabet.

Mapping:
A ↔ Z
B ↔ Y
C ↔ X
...and so on

Tips:
1. Create a lookup table
2. Find each letter's position from the start
3. Count the same position from the end
    `,
    technique: "Map each letter to its opposite position in the alphabet"
  },
  // Advanced Level
  {
    plaintext: "SECURE",
    hint: "Vigenère Cipher with key 'KEY' - Multiple shift cipher using a keyword",
    encrypted: "CIBYVW",
    difficulty: "advanced",
    points: 300,
    timeLimit: 240,
    category: "Polyalphabetic Ciphers",
    description: "Master the Vigenère Cipher, a more complex encryption method",
    image: "https://images.unsplash.com/photo-1526374870839-e155464bb9b2",
    tutorial: `
# Vigenère Cipher
A polyalphabetic substitution cipher using a keyword.

How it works:
1. Choose a keyword (e.g., 'KEY')
2. Repeat keyword to match message length
3. Shift each letter based on corresponding keyword letter

Example:
Message: HELLO
Key:     KEYKE
Result:  Shift H by K (10), E by E (4), etc.
    `,
    technique: "Use the Vigenère square to decrypt each letter using the key"
  }
];

export function CipherGame() {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTechnique, setShowTechnique] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [combo, setCombo] = useState(0);
  const [consoleHistory, setConsoleHistory] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

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

  const addToConsole = (command: string, output: string) => {
    setConsoleHistory(prev => [...prev, 
      `crypto@decoder:~$ ${command}`,
      `[${new Date().toLocaleTimeString()}] ${output}`
    ]);
  };

  const startChallenge = () => {
    setGameActive(true);
    setTimeLeft(cipherChallenges[currentChallenge].timeLimit);
    setInput('');
    setShowHint(false);
    setShowTutorial(false);
    setShowTechnique(false);
    setFeedback('');
    setConsoleHistory([]);
    addToConsole('initialize_challenge', `Loading ${cipherChallenges[currentChallenge].category} challenge...`);
  };

  const endChallenge = async (success: boolean) => {
    setGameActive(false);
    
    if (success) {
      const challenge = cipherChallenges[currentChallenge];
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
    } else {
      setCombo(0);
      sounds.error.play();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value.toUpperCase());
    sounds.keypress.play();
    addToConsole('input', e.target.value.toUpperCase());
  };

  const checkSolution = () => {
    const challenge = cipherChallenges[currentChallenge];
    if (input === challenge.plaintext) {
      setFeedback('Correct! Decryption successful!');
      addToConsole('verify_solution', 'Decryption successful! Moving to next challenge...');
      endChallenge(true);
      
      setTimeout(() => {
        if (currentChallenge < cipherChallenges.length - 1) {
          setCurrentChallenge(prev => prev + 1);
          startChallenge();
        } else {
          setFeedback('Congratulations! You\'ve completed all challenges!');
        }
      }, 2000);
    } else {
      setFeedback('Incorrect. Try again or use the hint.');
      addToConsole('verify_solution', 'Decryption failed. Attempting new approach...');
      endChallenge(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const challenge = cipherChallenges[currentChallenge];

  return (
    <div className="max-w-7xl mx-auto bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800">
      {!gameActive ? (
        <div className="text-center">
          <div className="mb-8">
            <Key className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Cryptography Challenge</h2>
            <p className="text-gray-400 mb-6">
              Test your decryption skills with various cipher challenges.
              Choose your difficulty level to begin!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {['beginner', 'intermediate', 'advanced'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff as any)}
                className={`p-6 rounded-lg transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="text-xl mb-2 capitalize">{diff}</div>
                <div className="text-sm opacity-75">
                  {diff === 'beginner' 
                    ? 'Start with basic ciphers'
                    : diff === 'intermediate'
                    ? 'Try more complex encryptions'
                    : 'Master advanced techniques'}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={startChallenge}
            className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 transition-colors transform hover:scale-105"
          >
            Start Challenge
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
                  timeLeft < 30 ? 'text-red-500' : 'text-blue-500'
                }`}>
                  <Timer className="w-4 h-4 mr-1" />
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className="relative mb-8">
              <img
                src={challenge.image}
                alt="Challenge Background"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{challenge.category}</h3>
                  <p className="text-gray-300">{challenge.description}</p>
                </div>
              </div>
            </div>

            <div className="bg-black rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Encrypted Message
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(challenge.encrypted)}
                  className="hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="font-mono text-green-500 text-lg tracking-wider">
                {challenge.encrypted}
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <input
                  type="text"
                  value={input}
                  onChange={handleInput}
                  className="w-full bg-gray-900 text-green-500 p-4 rounded-lg font-mono text-lg tracking-wider focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter decrypted message..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={checkSolution}
                className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Unlock className="w-5 h-5 mr-2" />
                Submit Solution
              </button>
              <button
                onClick={() => setShowHint(!showHint)}
                className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Brain className="w-5 h-5 mr-2" />
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowTutorial(!showTutorial)}
                className="bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <Shield className="w-5 h-5 mr-2" />
                {showTutorial ? 'Hide Tutorial' : 'Show Tutorial'}
              </button>
              <button
                onClick={() => setShowTechnique(!showTechnique)}
                className="bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <Terminal className="w-5 h-5 mr-2" />
                {showTechnique ? 'Hide Technique' : 'Show Technique'}
              </button>
            </div>

            {showHint && (
              <div className="mt-4 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <div className="flex items-center text-blue-400 mb-2">
                  <Brain className="w-5 h-5 mr-2" />
                  <span className="font-medium">Hint:</span>
                </div>
                <p className="text-blue-300">{challenge.hint}</p>
              </div>
            )}

            {showTutorial && (
              <div className="mt-4 bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                <div className="prose prose-invert max-w-none">
                  <pre className="text-purple-300 whitespace-pre-wrap">
                    {challenge.tutorial}
                  </pre>
                </div>
              </div>
            )}

            {showTechnique && (
              <div className="mt-4 bg-indigo-900/30 border border-indigo-700 rounded-lg p-4">
                <div className="flex items-center text-indigo-400 mb-2">
                  <Terminal className="w-5 h-5 mr-2" />
                  <span className="font-medium">Solution Technique:</span>
                </div>
                <p className="text-indigo-300">{challenge.technique}</p>
              </div>
            )}
          </div>

          <div>
            <div className="bg-black rounded-lg p-4 h-[600px] overflow-y-auto font-mono">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="flex items-center">
                  <Terminal className="w-4 h-4 mr-2" />
                  Decryption Console
                </span>
              </div>
              <div className="text-green-500">
                {consoleHistory.map((line, index) => (
                  <div 
                    key={index}
                    className={line.startsWith('crypto@decoder') ? 'text-blue-400' : 'text-gray-400'}
                  >
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
            Challenge {currentChallenge + 1}/{cipherChallenges.length}
          </div>
          {combo > 1 && (
            <div className="text-yellow-500 flex items-center">
              <Brain className="w-4 h-4 mr-1" />
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
  );
}