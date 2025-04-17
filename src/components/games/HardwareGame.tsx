import React, { useState } from 'react';
import { Cpu, Terminal, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const challenges = [
  {
    id: 'uart',
    title: 'UART Analysis',
    description: 'Identify and decode UART communication',
    difficulty: 'medium',
    points: 200,
    data: `
Baud Rate: 9600
Data: 0x48 0x45 0x4C 0x4C 0x4F
    `,
    hint: 'Convert hex to ASCII',
    solution: 'HELLO'
  },
  {
    id: 'i2c',
    title: 'I2C Protocol',
    description: 'Analyze I2C communication between devices',
    difficulty: 'hard',
    points: 300,
    data: `
SDA: |-_-_--|_-_-|
SCL: |--|--|--|--|
Address: 0x50
    `,
    hint: 'Look at the timing diagram',
    solution: '0x50'
  }
];

export function HardwareGame() {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);

  const checkSolution = async () => {
    const challenge = challenges[currentChallenge];
    const isCorrect = input.toUpperCase() === challenge.solution.toUpperCase();

    if (isCorrect) {
      setScore(score + challenge.points);
      setFeedback('Correct! Moving to next challenge...');
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ 
              points: score + challenge.points,
              level: score > 800 ? 'advanced' : score > 400 ? 'intermediate' : 'beginner'
            })
            .eq('id', user.id);
        }
      } catch (error) {
        console.error('Error updating score:', error);
      }

      setTimeout(() => {
        if (currentChallenge < challenges.length - 1) {
          setCurrentChallenge(currentChallenge + 1);
          setInput('');
          setFeedback('');
          setShowHint(false);
        } else {
          setFeedback('Congratulations! You completed all hardware challenges!');
        }
      }, 2000);
    } else {
      setFeedback('Incorrect solution. Try again!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800">
      <div className="text-center mb-8">
        <Cpu className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Hardware Security Challenge</h2>
        <p className="text-gray-400">Master embedded systems and hardware protocols</p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            challenges[currentChallenge].difficulty === 'easy' ? 'bg-green-900 text-green-200' :
            challenges[currentChallenge].difficulty === 'medium' ? 'bg-yellow-900 text-yellow-200' :
            'bg-red-900 text-red-200'
          }`}>
            {challenges[currentChallenge].difficulty}
          </span>
          <span className="text-yellow-500">{challenges[currentChallenge].points} pts</span>
        </div>

        <h3 className="text-xl font-bold mb-2">{challenges[currentChallenge].title}</h3>
        <p className="text-gray-400 mb-4">{challenges[currentChallenge].description}</p>

        <div className="bg-black rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Signal Data
            </span>
          </div>
          <pre className="font-mono text-green-500 overflow-x-auto">
            {challenges[currentChallenge].data}
          </pre>
        </div>

        {showHint && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-4">
            <div className="flex items-center text-blue-400 mb-2">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span className="font-medium">Hint:</span>
            </div>
            <p className="text-blue-300">{challenges[currentChallenge].hint}</p>
          </div>
        )}

        <div className="mb-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-gray-900 text-green-500 p-4 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter your solution..."
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={checkSolution}
            className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
          >
            <Terminal className="w-5 h-5 mr-2" />
            Submit Analysis
          </button>
          <button
            onClick={() => setShowHint(true)}
            className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Show Hint
          </button>
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

      <div className="flex justify-between items-center">
        <div className="text-gray-400">
          Challenge {currentChallenge + 1}/{challenges.length}
        </div>
        <div className="text-orange-500 font-bold">
          Score: {score}
        </div>
      </div>
    </div>
  );
}