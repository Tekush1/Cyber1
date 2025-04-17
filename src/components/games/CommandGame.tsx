import React, { useState, useEffect } from 'react';
import { Terminal, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const commands = [
  { command: 'nmap -sS target.com', description: 'Perform a SYN scan' },
  { command: 'sqlmap --url http://target.com', description: 'Test for SQL injection' },
  { command: 'dirb http://target.com', description: 'Directory enumeration' },
  { command: 'hydra -l admin -P wordlist.txt target.com ssh', description: 'Brute force SSH' },
  { command: 'wireshark -i eth0', description: 'Capture network traffic' },
  { command: 'john --wordlist=passwords.txt hash.txt', description: 'Crack password hashes' },
  { command: 'nikto -h target.com', description: 'Web server security scan' },
  { command: 'tcpdump -i eth0 port 80', description: 'Capture HTTP traffic' }
];

export function CommandGame() {
  const [currentCommand, setCurrentCommand] = useState('');
  const [targetCommand, setTargetCommand] = useState(commands[0]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);

  useEffect(() => {
    let timer: number;
    if (gameActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameActive(false);
      updateUserScore();
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);

  const updateUserScore = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ 
            points: score,
            level: score > 800 ? 'advanced' : score > 400 ? 'intermediate' : 'beginner'
          })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameActive(true);
    setTargetCommand(commands[Math.floor(Math.random() * commands.length)]);
    setCurrentCommand('');
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!gameActive) return;
    setCurrentCommand(e.target.value);
    
    if (e.target.value === targetCommand.command) {
      setScore((s) => s + 100);
      setCurrentCommand('');
      setTargetCommand(commands[Math.floor(Math.random() * commands.length)]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800">
      {!gameActive && timeLeft === 60 ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Test Your Command Skills?</h2>
          <p className="text-gray-400 mb-6">
            Type the shown commands as quickly and accurately as possible.
            You have 60 seconds to score as high as possible!
          </p>
          <button
            onClick={startGame}
            className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors"
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <div className="text-2xl font-bold text-red-500">Score: {score}</div>
            <div className="text-xl text-gray-300">Time: {timeLeft}s</div>
          </div>

          <div className="mb-8">
            <div className="text-gray-400 mb-2">Type this command:</div>
            <div className="bg-black p-4 rounded-lg font-mono text-green-500">
              {targetCommand.command}
            </div>
            <div className="text-gray-400 mt-2">
              Description: {targetCommand.description}
            </div>
          </div>

          <input
            type="text"
            value={currentCommand}
            onChange={handleInput}
            className="w-full bg-black border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 font-mono focus:border-red-500 focus:ring-red-500"
            placeholder="Type the command here..."
            disabled={!gameActive}
          />

          {timeLeft === 0 && (
            <div className="mt-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Game Over!</h3>
              <p className="text-red-500 text-xl mb-6">Final Score: {score}</p>
              <button
                onClick={startGame}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center mx-auto"
              >
                Play Again
                <RefreshCw className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}