import React, { useState, useEffect } from 'react';
import { Globe, Terminal, AlertTriangle, CheckCircle2, Code, Shield, Skull, Target, Lock, Bug, Wifi, Database, Server } from 'lucide-react';
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
    id: 'xss-basic',
    title: 'Cross-Site Scripting (XSS) - Basic',
    description: 'Learn how to identify and exploit basic XSS vulnerabilities',
    difficulty: 'beginner',
    points: 100,
    image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de',
    scenario: 'A blog website allows users to post comments without proper sanitization.',
    documentation: `
# Cross-Site Scripting (XSS) Tutorial

XSS allows attackers to inject malicious scripts into web pages viewed by other users.

Types of XSS:
1. Reflected XSS - Script is reflected off web server
2. Stored XSS - Script is stored on the server
3. DOM-based XSS - Vulnerability exists in client-side code

Common XSS Payloads:
- Basic: <script>alert('XSS')</script>
- Image: <img src="x" onerror="alert('XSS')">
- JavaScript Event: <body onload="alert('XSS')">

Prevention:
- Input validation
- Output encoding
- Content Security Policy (CSP)
- HttpOnly cookies
    `,
    code: `
<!-- Vulnerable Comment Form -->
<form onsubmit="addComment()">
  <input type="text" id="comment">
  <button type="submit">Post</button>
</form>

<script>
function addComment() {
  const comment = document.getElementById('comment').value;
  // Vulnerable: Direct innerHTML assignment
  document.getElementById('comments').innerHTML += comment;
}
</script>
    `,
    hint: 'Try injecting a simple <script> tag with an alert() function. The website directly inserts user input into the DOM.',
    solution: '<script>alert("hacked")</script>',
    technique: 'Insert a script tag that executes JavaScript when the comment is posted. This works because the input is not sanitized.',
    icon: Bug
  },
  {
    id: 'sqli-basic',
    title: 'SQL Injection - Basic',
    description: 'Learn how to perform basic SQL injection attacks',
    difficulty: 'beginner',
    points: 150,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31',
    scenario: 'A login form is vulnerable to SQL injection. Try to bypass the authentication.',
    documentation: `
# SQL Injection Tutorial

SQL Injection allows attackers to manipulate database queries by injecting malicious SQL code.

Basic SQL Injection Techniques:
1. Authentication Bypass
2. Union-Based Injection
3. Boolean-Based Injection
4. Time-Based Injection

Common SQL Injection Payloads:
- Basic: ' OR '1'='1
- Union: ' UNION SELECT username,password FROM users--
- Comment: admin'-- 
- Always True: ' OR 'x'='x

Prevention:
- Use Prepared Statements
- Input Validation
- Parameterized Queries
- Least Privilege Access
    `,
    code: `
$query = "SELECT * FROM users 
         WHERE username = '$username' 
         AND password = '$password'";
$result = mysqli_query($conn, $query);

if(mysqli_num_rows($result) > 0) {
  // Login successful
  $_SESSION['user'] = $username;
} else {
  // Login failed
  echo "Invalid credentials";
}
    `,
    hint: 'The login query can be manipulated using single quotes and SQL OR operator. Try making the WHERE clause always true.',
    solution: "admin' OR '1'='1",
    technique: 'Use a single quote to break out of the SQL string, then add OR with a condition that is always true.',
    icon: Database
  },
  {
    id: 'csrf-basic',
    title: 'Cross-Site Request Forgery (CSRF) - Basic',
    description: 'Learn how to identify and exploit CSRF vulnerabilities',
    difficulty: 'beginner',
    points: 200,
    image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7',
    scenario: 'A website allows users to change their email address but does not implement CSRF protection.',
    documentation: `
# CSRF Tutorial

CSRF tricks users into submitting malicious requests to websites where they're authenticated.

How CSRF Works:
1. User is authenticated on target site
2. User visits malicious site
3. Malicious site triggers request to target site
4. Request includes user's cookies

Common CSRF Vectors:
- HTML Forms
- Image Tags
- XMLHttpRequest
- Fetch API

Prevention:
- CSRF Tokens
- SameSite Cookies
- Custom Headers
- Referrer Validation
    `,
    code: `
<!-- Vulnerable Email Change Form -->
<form action="/change-email" method="POST">
  <input type="email" name="new_email">
  <button type="submit">Update Email</button>
</form>

<!-- Example CSRF Attack -->
<img src="http://bank.com/transfer?to=attacker&amount=1000">
    `,
    hint: 'Create an HTML form that automatically submits to the target website. The form can be triggered when the victim loads your page.',
    solution: `<form action="http://target.com/email/change" method="POST" id="csrf-form">
  <input type="hidden" name="email" value="hacker@evil.com">
</form>
<script>document.getElementById("csrf-form").submit();</script>`,
    technique: 'Create a form that automatically submits to the target website when loaded. Since there\'s no CSRF token, the request will be processed.',
    icon: Shield
  }
];

export function WebGame() {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showTechnique, setShowTechnique] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [showScenario, setShowScenario] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes per challenge
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentChallenge]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    sounds.keypress.play();
  };

  const addToTerminal = (command: string, output: string) => {
    setTerminalHistory(prev => [...prev, 
      `root@kali:~# ${command}`,
      `[${new Date().toLocaleTimeString()}] ${output}`
    ]);
  };

  const checkSolution = async () => {
    const challenge = challenges[currentChallenge];
    const isCorrect = input.toLowerCase().includes(challenge.solution.toLowerCase());

    if (isCorrect) {
      sounds.success.play();
      const timeBonus = Math.floor(timeLeft / 10);
      const comboBonus = combo * 50;
      const totalPoints = challenge.points + timeBonus + comboBonus;
      
      setScore(score + totalPoints);
      setCombo(combo + 1);
      setFeedback(`Excellent! +${totalPoints} points (Time Bonus: +${timeBonus}, Combo: x${combo + 1})`);
      
      addToTerminal(input, 'Exploit successful! Vulnerability confirmed.');

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
          setCurrentChallenge(currentChallenge + 1);
          setInput('');
          setFeedback('');
          setShowHint(false);
          setShowDocumentation(false);
          setShowTechnique(false);
          setShowScenario(true);
          setTimeLeft(300);
          setTerminalHistory([]);
          sounds.levelUp.play();
        } else {
          setFeedback('🏆 Congratulations! You\'ve completed all challenges!');
        }
      }, 2000);
    } else {
      sounds.error.play();
      setCombo(0);
      setFeedback('Exploit failed. Check your payload and try again.');
      addToTerminal(input, 'Attack failed. Target defenses blocked the attempt.');
    }
  };

  const challenge = challenges[currentChallenge];
  const Icon = challenge.icon;

  return (
    <div className="max-w-7xl mx-auto bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800">
      {showScenario ? (
        <div className="text-center p-8">
          <div className="relative mb-8 rounded-lg overflow-hidden">
            <img 
              src={challenge.image} 
              alt="Mission Scenario"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
              <Icon className="w-12 h-12 text-red-500 mr-4" />
              <div className="text-left">
                <h2 className="text-2xl font-bold text-white mb-2">{challenge.title}</h2>
                <p className="text-gray-300">{challenge.description}</p>
              </div>
            </div>
          </div>
          <div className="bg-black/50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-bold mb-4">Mission Briefing</h3>
            <p className="text-gray-300 mb-4">{challenge.scenario}</p>
          </div>
          <button
            onClick={() => setShowScenario(false)}
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Begin Mission
          </button>
        </div>
      ) : (
        <>
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
                  <span className="text-blue-500">{formatTime(timeLeft)}</span>
                </div>
              </div>

              <div className="bg-black rounded-lg p-4 mb-4 font-mono">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    Target Environment
                  </span>
                </div>
                <pre className="text-green-500 overflow-x-auto">
                  {challenge.code}
                </pre>
              </div>

              <div className="mb-4">
                <div className="bg-[#1E1E1E] p-4 rounded-lg">
                  <div className="flex items-center mb-2 bg-[#2D2D2D] p-2 rounded">
                    <span className="text-green-500 mr-2">root@kali</span>
                    <span className="text-gray-400">:</span>
                    <span className="text-blue-500 mr-2">~</span>
                    <span className="text-gray-400">#</span>
                  </div>
                  <textarea
                    value={input}
                    onChange={handleInput}
                    className="w-full bg-[#1E1E1E] text-green-500 p-4 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
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
                  <Terminal className="w-5 h-5 mr-2" />
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
                  onClick={() => setShowDocumentation(!showDocumentation)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showDocumentation ? 'Hide Documentation' : 'Show Documentation'}
                </button>
                <button
                  onClick={() => setShowTechnique(!showTechnique)}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {showTechnique ? 'Hide Technique' : 'Show Technique'}
                </button>
              </div>

              {showHint && (
                <div className="mt-4 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                  <div className="flex items-center text-blue-400 mb-2">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Hint:</span>
                  </div>
                  <p className="text-blue-300">{challenge.hint}</p>
                </div>
              )}

              {showDocumentation && (
                <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="prose prose-invert max-w-none">
                    <pre className="text-gray-300 whitespace-pre-wrap">
                      {challenge.documentation}
                    </pre>
                  </div>
                </div>
              )}

              {showTechnique && (
                <div className="mt-4 bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                  <div className="flex items-center text-purple-400 mb-2">
                    <Target className="w-5 h-5 mr-2" />
                    <span className="font-medium">Solution Technique:</span>
                  </div>
                  <p className="text-purple-300">{challenge.technique}</p>
                </div>
              )}
            </div>

            <div>
              <div className="bg-[#1E1E1E] rounded-lg p-4 h-[600px] overflow-y-auto font-mono">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="flex items-center">
                    <Terminal className="w-4 h-4 mr-2" />
                    Kali Terminal
                  </span>
                </div>
                <div className="text-green-500">
                  {terminalHistory.map((line, index) => (
                    <div key={index} className={line.startsWith('root@kali') ? 'text-green-400' : 'text-gray-400'}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-gray-400">
                Challenge {currentChallenge + 1}/{challenges.length}
              </div>
              {combo > 1 && (
                <div className="text-yellow-500 flex items-center">
                  <Target className="w-4 h-4 mr-1" />
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
        </>
      )}
    </div>
  );
}