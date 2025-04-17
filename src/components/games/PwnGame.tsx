import React, { useState, useEffect, useRef } from 'react';
import { Shield, Terminal, AlertTriangle, CheckCircle2, Code, Brain, Target, Trophy, Timer, RefreshCw, Cpu, Zap, Lock } from 'lucide-react';
import { Howl } from 'howler';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { supabase } from '../../lib/supabaseClient';
import 'xterm/css/xterm.css';

// Sound effects
const sounds = {
  keypress: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'] }),
  success: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'] }),
  error: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'] }),
  levelUp: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3'] }),
  exploit: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3'] })
};

const challenges = [
  {
    id: 'stack-intro',
    title: 'Stack Introduction',
    description: 'Learn about stack memory and how it can be manipulated',
    difficulty: 'beginner',
    points: 100,
    image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97',
    timeLimit: 300,
    code: `
#include <stdio.h>
#include <string.h>

void vulnerable_function(char *input) {
    char buffer[16];
    strcpy(buffer, input);  // No bounds checking!
    printf("Input received: %s\\n", buffer);
}

int main() {
    char input[100];
    printf("Enter some text: ");
    gets(input);  // Dangerous!
    vulnerable_function(input);
    return 0;
}
    `,
    hint: 'The buffer is 16 bytes, but strcpy() will copy everything. What happens if we write more?',
    solution: 'A'.repeat(20),
    tutorial: `
# Stack Buffer Overflow Basics

Stack memory works like a stack of plates:
1. Local variables are stored on the stack
2. The buffer has a fixed size (16 bytes)
3. Writing beyond the buffer overwrites adjacent memory

Key Concepts:
- Buffer: Fixed-size memory area
- Stack: Last-in-first-out memory structure
- Buffer Overflow: Writing beyond buffer boundaries

Try:
1. Input exactly 16 characters (fills buffer)
2. Input more than 16 characters (overflow!)
    `,
    memoryLayout: `
[     Return Address    ] <- Higher addresses
[    Saved Frame Ptr   ]
[   Local Variables    ]
[   16-byte Buffer    ] <- buffer[16]
[         ...         ]
    `,
    setup: `
gdb-peda$ info functions
0x08048456  vulnerable_function
0x08048496  main

gdb-peda$ disass vulnerable_function
   0x08048456 <+0>:     push   ebp
   0x08048457 <+1>:     mov    ebp,esp
   0x08048459 <+3>:     sub    esp,0x18
    `
  },
  {
    id: 'format-string',
    title: 'Format String Vulnerability',
    description: 'Discover how format strings can be exploited',
    difficulty: 'beginner',
    points: 150,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
    timeLimit: 420,
    code: `
#include <stdio.h>

void print_message(char *msg) {
    printf(msg);  // Vulnerable: direct format string
}

int main() {
    char input[100];
    printf("Enter message: ");
    fgets(input, sizeof(input), stdin);
    print_message(input);
    return 0;
}
    `,
    hint: 'What happens if we use format specifiers like %x or %p in our input?',
    solution: '%x %x %x %x',
    tutorial: `
# Format String Vulnerabilities

Format strings control printf's behavior:
- %s: Print string
- %x: Print hex
- %n: Write count to address

Dangerous when user input is used directly:
1. printf(user_input) ❌
2. printf("%s", user_input) ✅

Try:
1. Input normal text
2. Input %x to leak memory
3. Count how many %x until interesting data
    `,
    memoryLayout: `
[    Stack Frame 3    ]
[    Stack Frame 2    ]
[    Stack Frame 1    ]
[     Format Args     ] <- printf reads from here
[    Format String    ] <- user input
    `,
    setup: `
gdb-peda$ break print_message
gdb-peda$ run
gdb-peda$ x/32wx $esp
    `
  },
  {
    id: 'shellcode-intro',
    title: 'Introduction to Shellcode',
    description: 'Learn how to execute custom code through buffer overflows',
    difficulty: 'intermediate',
    points: 250,
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    timeLimit: 600,
    code: `
#include <stdio.h>
#include <string.h>

void vulnerable_function(char *input) {
    char buffer[64];
    strcpy(buffer, input);
    printf("Data copied to buffer\\n");
}

int main() {
    char input[200];
    gets(input);
    vulnerable_function(input);
    return 0;
}
    `,
    hint: 'First overflow the buffer, then redirect execution to your shellcode. Look for NOP sleds!',
    solution: '\x90'.repeat(32) + 'shellcode',
    tutorial: `
# Shellcode Execution

Shellcode is machine code that:
1. Usually spawns a shell
2. Must be position-independent
3. Avoids null bytes

Components:
- NOP Sled: Series of \\x90 bytes
- Shellcode: Actual payload
- Return Address: Jump to shellcode

Steps:
1. Find buffer size
2. Create NOP sled
3. Add shellcode
4. Overwrite return address
    `,
    memoryLayout: `
[    Return Address    ] <- Overwrite with shellcode addr
[         ...         ]
[      NOP Sled      ] <- Many \\x90 bytes
[     Shellcode      ] <- Your payload
[     More NOPs      ]
[         ...         ]
    `,
    setup: `
gdb-peda$ checksec
CANARY    : disabled
NX        : disabled
PIE       : disabled
RELRO     : Partial
    `
  }
];

export function PwnGame() {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMemoryLayout, setShowMemoryLayout] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [consoleHistory, setConsoleHistory] = useState<string[]>([]);
  const [showScenario, setShowScenario] = useState(true);
  const [combo, setCombo] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);

  useEffect(() => {
    if (terminalRef.current && !xtermRef.current) {
      const term = new XTerm({
        theme: {
          background: '#1a1b26',
          foreground: '#a9b1d6',
          cursor: '#c0caf5'
        },
        cursorBlink: true,
        fontSize: 14
      });
      
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();
      
      term.writeln('\x1b[1;32mPWN Challenge Terminal\x1b[0m');
      term.writeln('Type your commands here...');
      
      term.onKey(({ key, domEvent }) => {
        sounds.keypress.play();
        const char = domEvent.key;
        if (char === 'Enter') {
          const line = term.buffer.active.getLine(term.buffer.active.cursorY)?.translateToString() || '';
          term.writeln('');
          processCommand(line.trim());
        } else if (char === 'Backspace') {
          term.write('\b \b');
        } else {
          term.write(char);
        }
      });
      
      xtermRef.current = term;
    }
    
    return () => {
      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
      }
    };
  }, []);

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

  const processCommand = (command: string) => {
    if (!xtermRef.current) return;
    
    const term = xtermRef.current;
    
    if (command.startsWith('help')) {
      term.writeln('\r\n\x1b[1;33mAvailable Commands:\x1b[0m');
      term.writeln('  analyze - Analyze current binary');
      term.writeln('  exploit - Attempt to exploit the vulnerability');
      term.writeln('  memory  - Show memory layout');
      term.writeln('  clear   - Clear terminal');
      term.writeln('');
    } else if (command === 'clear') {
      term.clear();
    } else if (command === 'analyze') {
      term.writeln('\r\n\x1b[1;34mAnalyzing binary...\x1b[0m');
      term.writeln(challenges[currentChallenge].setup);
      term.writeln('');
    } else if (command === 'memory') {
      term.writeln('\r\n\x1b[1;35mMemory Layout:\x1b[0m');
      term.writeln(challenges[currentChallenge].memoryLayout);
      term.writeln('');
    } else if (command.startsWith('exploit')) {
      sounds.exploit.play();
      term.writeln('\r\n\x1b[1;31mAttempting exploit...\x1b[0m');
      term.writeln('Sending payload...');
      setTimeout(() => {
        term.writeln('Checking result...');
      }, 500);
    }
    
    term.write('\r\n$ ');
  };

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
    setShowMemoryLayout(false);
    setFeedback('');
    setConsoleHistory([]);
    addToConsole('start_pwn', 'Starting exploitation attempt...');
  };

  const addToConsole = (command: string, output: string) => {
    setConsoleHistory(prev => [...prev, 
      `pwn@exploit:~$ ${command}`,
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
      addToConsole('verify_exploit', 'Exploitation successful! Shell spawned.');

      setTimeout(() => {
        if (currentChallenge < challenges.length - 1) {
          setCurrentChallenge(prev => prev + 1);
          setShowScenario(true);
          sounds.levelUp.play();
        } else {
          setFeedback('Congratulations! You\'ve completed all PWN challenges!');
        }
      }, 2000);
    } else {
      sounds.error.play();
      setCombo(0);
      setFeedback('Exploitation failed. Review your payload and try again.');
      addToConsole('verify_exploit', 'Exploit failed. Segmentation fault.');
    }
  };

  const checkSolution = () => {
    const challenge = challenges[currentChallenge];
    const isCorrect = input === challenge.solution;

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
              <Shield className="w-12 h-12 text-red-500 mr-4" />
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
                  <Brain className="w-5 h-5 text-red-500 mr-2" />
                  Assembly knowledge
                </li>
                <li className="flex items-center text-gray-300">
                  <Cpu className="w-5 h-5 text-red-500 mr-2" />
                  Memory management
                </li>
                <li className="flex items-center text-gray-300">
                  <Lock className="w-5 h-5 text-red-500 mr-2" />
                  Exploit development
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={startChallenge}
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors transform hover:scale-105"
          >
            Start Exploitation
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
                  Vulnerable Program
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
                  className="w-full bg-gray-900 text-red-500 p-4 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={4}
                  placeholder="Enter your exploit payload..."
                />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <button
                onClick={checkSolution}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <Zap className="w-5 h-5 mr-2" />
                Execute Exploit
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
              <button
                onClick={() => setShowMemoryLayout(!showMemoryLayout)}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                {showMemoryLayout ? 'Hide Memory Layout' : 'Show Memory Layout'}
              </button>
            </div>

            {showHint && (
              <div className="mt-4 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <div className="flex items-center text-blue-400 mb-2">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Exploitation Hint:</span>
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

            {showMemoryLayout && (
              <div className="mt-4 bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                <div className="flex items-center text-purple-400 mb-2">
                  <Cpu className="w-5 h-5 mr-2" />
                  <span className="font-medium">Memory Layout:</span>
                </div>
                <pre className="text-purple-300 font-mono">
                  {challenge.memoryLayout}
                </pre>
              </div>
            )}
          </div>

          <div>
            <div className="bg-[#1a1b26] rounded-lg p-4 h-[600px] overflow-hidden">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="flex items-center">
                  <Terminal className="w-4 h-4 mr-2" />
                  Exploitation Terminal
                </span>
              </div>
              <div ref={terminalRef} className="h-full" />
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
        <div className="text-red-500 font-bold text-xl">
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