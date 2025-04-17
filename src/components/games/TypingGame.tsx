import React, { useState, useEffect, useRef } from 'react';
import { Terminal, RefreshCw, Timer, Command, Trophy } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const hackingCommands = [
  { command: 'nmap -sS -sV -O target.com', description: 'Service and OS detection scan' },
  { command: 'sqlmap -u "http://target.com/page.php?id=1" --dbs', description: 'Database enumeration' },
  { command: 'hydra -l admin -P wordlist.txt ssh://target.com', description: 'SSH brute force' },
  { command: 'gobuster dir -u http://target.com -w wordlist.txt', description: 'Directory enumeration' },
  { command: 'wireshark -i eth0 -w capture.pcap', description: 'Network packet capture' },
  { command: 'hashcat -m 0 -a 0 hash.txt wordlist.txt', description: 'Hash cracking' },
  { command: 'msfconsole -q -x "use exploit/multi/handler"', description: 'Metasploit handler' },
  { command: 'john --wordlist=rockyou.txt hash.txt', description: 'Password cracking' },
  { command: 'tcpdump -i eth0 -n -w capture.pcap', description: 'Packet capture' },
  { command: 'dirb http://target.com -r -w', description: 'Web content scanning' },
  { command: 'nikto -h target.com -C all', description: 'Web server scanning' },
  { command: 'wpscan --url http://target.com --enumerate u', description: 'WordPress scanning' }
];

const timeOptions = [
  { value: 60, label: '1 Minute' },
  { value: 120, label: '2 Minutes' },
  { value: 300, label: '5 Minutes' },
  { value: 600, label: '10 Minutes' }
];

const trophies = {
  speed: [
    { wpm: 100, name: 'Speed Demon', icon: '🏃' },
    { wpm: 80, name: 'Swift Hacker', icon: '⚡' },
    { wpm: 60, name: 'Quick Fingers', icon: '🎯' }
  ],
  accuracy: [
    { accuracy: 98, name: 'Precision Master', icon: '🎯' },
    { accuracy: 95, name: 'Sharp Eye', icon: '👁️' },
    { accuracy: 90, name: 'Steady Hand', icon: '🤚' }
  ],
  endurance: [
    { time: 600, commands: 50, name: 'Marathon Hacker', icon: '🏆' },
    { time: 300, commands: 25, name: 'Persistent Coder', icon: '💪' },
    { time: 120, commands: 15, name: 'Quick Sprint', icon: '🏃' }
  ]
};

export function TypingGame() {
  const [currentCommand, setCurrentCommand] = useState('');
  const [targetCommand, setTargetCommand] = useState(hackingCommands[0]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [wpm, setWpm] = useState(0);
  const [selectedTime, setSelectedTime] = useState(60);
  const [timeLeft, setTimeLeft] = useState(selectedTime);
  const [gameActive, setGameActive] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [completedCommands, setCompletedCommands] = useState(0);
  const [earnedTrophies, setEarnedTrophies] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let timer: number;
    if (gameActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(time => time - 1);
        calculateWPM();
      }, 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);

  const calculateWPM = () => {
    const minutes = (selectedTime - timeLeft) / 60;
    if (minutes > 0) {
      const words = totalKeystrokes / 5; // Standard: 5 keystrokes = 1 word
      setWpm(Math.round(words / minutes));
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(selectedTime);
    setGameActive(true);
    setMistakes(0);
    setTotalKeystrokes(0);
    setAccuracy(100);
    setWpm(0);
    setInput('');
    setCompletedCommands(0);
    setEarnedTrophies([]);
    setTargetCommand(hackingCommands[Math.floor(Math.random() * hackingCommands.length)]);
    inputRef.current?.focus();
  };

  const checkTrophies = () => {
    const newTrophies: string[] = [];
    
    // Check speed trophies
    trophies.speed.forEach(trophy => {
      if (wpm >= trophy.wpm && !earnedTrophies.includes(trophy.name)) {
        newTrophies.push(`${trophy.icon} ${trophy.name}`);
      }
    });

    // Check accuracy trophies
    trophies.accuracy.forEach(trophy => {
      if (accuracy >= trophy.accuracy && !earnedTrophies.includes(trophy.name)) {
        newTrophies.push(`${trophy.icon} ${trophy.name}`);
      }
    });

    // Check endurance trophies
    trophies.endurance.forEach(trophy => {
      if (selectedTime >= trophy.time && completedCommands >= trophy.commands && !earnedTrophies.includes(trophy.name)) {
        newTrophies.push(`${trophy.icon} ${trophy.name}`);
      }
    });

    if (newTrophies.length > 0) {
      setEarnedTrophies(prev => [...prev, ...newTrophies]);
    }
  };

  const endGame = async () => {
    setGameActive(false);
    checkTrophies();
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

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!gameActive) return;
    
    const newInput = e.target.value;
    setInput(newInput);
    setTotalKeystrokes(prev => prev + 1);

    if (newInput === targetCommand.command) {
      setScore(s => s + 100);
      setCompletedCommands(prev => prev + 1);
      setInput('');
      setTargetCommand(hackingCommands[Math.floor(Math.random() * hackingCommands.length)]);
    } else if (newInput.length > targetCommand.command.length || 
               !targetCommand.command.startsWith(newInput)) {
      setMistakes(prev => prev + 1);
      setAccuracy(Math.max(0, Math.round((1 - mistakes / totalKeystrokes) * 100)));
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800">
      {!gameActive && timeLeft === selectedTime ? (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Hacker Command Typing Challenge</h2>
          <p className="text-gray-400 mb-6">
            Master the art of typing security commands quickly and accurately.
            Choose your challenge duration!
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {timeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedTime(option.value)}
                className={`p-4 rounded-lg transition-colors ${
                  selectedTime === option.value
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            onClick={startGame}
            className="bg-red-600 text-white py-3 px-8 rounded-lg hover:bg-red-700 transition-colors"
          >
            Start Challenge
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/30 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">WPM</div>
              <div className="text-2xl font-bold text-green-500">{wpm}</div>
            </div>
            <div className="bg-black/30 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Accuracy</div>
              <div className="text-2xl font-bold text-blue-500">{accuracy}%</div>
            </div>
            <div className="bg-black/30 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Score</div>
              <div className="text-2xl font-bold text-red-500">{score}</div>
            </div>
            <div className="bg-black/30 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Time</div>
              <div className="text-2xl font-bold text-yellow-500">{timeLeft}s</div>
            </div>
          </div>

          <div className="mb-8">
            <div className="text-gray-400 mb-2">Type this command:</div>
            <div className="bg-black p-4 rounded-lg font-mono text-green-500 mb-2">
              {targetCommand.command}
            </div>
            <div className="text-sm text-gray-500">
              Purpose: {targetCommand.description}
            </div>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInput}
            className="w-full bg-black border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 font-mono focus:border-red-500 focus:ring-red-500"
            placeholder="Type the command here..."
            disabled={!gameActive}
          />

          {timeLeft === 0 && (
            <div className="mt-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Challenge Complete!</h3>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Final WPM</div>
                    <div className="text-xl font-bold text-green-500">{wpm}</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Accuracy</div>
                    <div className="text-xl font-bold text-blue-500">{accuracy}%</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Commands</div>
                    <div className="text-xl font-bold text-yellow-500">{completedCommands}</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Score</div>
                    <div className="text-xl font-bold text-red-500">{score}</div>
                  </div>
                </div>

                {earnedTrophies.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold mb-4">Trophies Earned!</h4>
                    <div className="flex flex-wrap justify-center gap-4">
                      {earnedTrophies.map((trophy, index) => (
                        <div key={index} className="bg-yellow-900/50 text-yellow-200 px-4 py-2 rounded-lg flex items-center gap-2">
                          <Trophy className="w-5 h-5" />
                          <span>{trophy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={startGame}
                  className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center mx-auto"
                >
                  Try Again
                  <RefreshCw className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}