import React, { useState, useEffect } from 'react';
import { Search, Terminal, AlertTriangle, CheckCircle2, Globe, Eye, Lock, User, MapPin, Calendar, Mail, Phone, Link, FileSearch } from 'lucide-react';
import { Howl } from 'howler';
import { supabase } from '../../lib/supabaseClient';
import ReactMarkdown from 'react-markdown';

// Sound effects
const sounds = {
  keypress: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'] }),
  success: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'] }),
  error: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'] }),
  levelUp: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3'] })
};

const challenges = [
  {
    id: 'social-basic',
    title: 'Social Media Investigation - Beginner',
    description: 'Learn basic social media OSINT techniques',
    difficulty: 'beginner',
    points: 100,
    timeLimit: 300,
    category: 'Social Media',
    scenario: {
      title: 'Instagram Profile Analysis',
      description: 'A suspicious Instagram account has been reported for potential scam activities.',
      target: {
        username: 'tech.guru.2024',
        platform: 'Instagram',
        publicInfo: {
          bio: 'Tech Enthusiast 💻 | Investor 📈 | DM for exclusive crypto deals!',
          joinDate: '2024-01',
          location: 'Silicon Valley, CA',
          posts: 12,
          followers: 15432,
          following: 127
        },
        recentActivity: [
          'Posted about a "guaranteed 1000% return" crypto investment',
          'Multiple users reporting suspicious DMs',
          'Account shows sudden follower growth'
        ]
      }
    },
    objectives: [
      'Identify red flags in the profile',
      'Find inconsistencies in the account details',
      'Determine if this is likely a scam account'
    ],
    hints: [
      'Check the follower to following ratio',
      'Look at the account creation date vs. claimed expertise',
      'Analyze the language used in posts'
    ],
    acceptedAnswers: [
      'scam',
      'fake account',
      'fraudulent',
      'crypto scam',
      'investment scam',
      'suspicious account',
      'scammer'
    ],
    keywords: [
      'scam',
      'fake',
      'fraud',
      'suspicious'
    ],
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113',
    tutorial: `
# Social Media OSINT Basics

When investigating social media profiles, look for:

1. Account Age vs. Claims
   - New accounts claiming extensive experience
   - Sudden changes in activity

2. Follower Patterns
   - Unusual follower/following ratios
   - Rapid follower growth

3. Content Analysis
   - Promises of unrealistic returns
   - Urgency in messaging
   - Poor grammar or inconsistent language
    `
  },
  {
    id: 'facebook-investigation',
    title: 'Facebook Profile Analysis',
    description: 'Advanced social media investigation techniques',
    difficulty: 'intermediate',
    points: 200,
    timeLimit: 420,
    category: 'Social Media',
    scenario: {
      title: 'Missing Person Investigation',
      description: 'Help locate a missing person using their last known Facebook activity.',
      target: {
        name: 'Alex Thompson',
        lastSeen: '2024-03-10',
        profile: {
          workplace: 'Coffee Bean & Tea Leaf',
          location: 'Downtown Seattle',
          recentPosts: [
            'Can\'t wait for the hiking trip this weekend! Mount Rainier here I come!',
            'New job starting next week, time for a change',
            'Anyone know any good apartments in Portland?'
          ],
          photos: [
            'Selfie at Pike Place Market',
            'Coffee shop interior',
            'Trail map screenshot'
          ]
        }
      }
    },
    objectives: [
      'Determine likely current location',
      'Identify travel patterns',
      'Find potential leads for investigation'
    ],
    hints: [
      'Look for location patterns in posts',
      'Check job-related information',
      'Analyze recent activity changes'
    ],
    acceptedAnswers: [
      'portland',
      'portland oregon',
      'portland, or',
      'portland or',
      'moving to portland',
      'relocated to portland'
    ],
    keywords: [
      'portland',
      'oregon',
      'moving',
      'relocate'
    ],
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41',
    tutorial: `
# Advanced Social Media Investigation

Key investigation points:

1. Timeline Analysis
   - Map out activity patterns
   - Note sudden changes
   - Look for life event indicators

2. Location Tracking
   - Check-ins and tagged locations
   - Background details in photos
   - Mentioned landmarks

3. Network Analysis
   - Friend connections
   - Group memberships
   - Event participation
    `
  },
  {
    id: 'linkedin-research',
    title: 'Professional Network Analysis',
    description: 'Corporate intelligence gathering',
    difficulty: 'advanced',
    points: 300,
    timeLimit: 600,
    category: 'Professional Networks',
    scenario: {
      title: 'Company Research',
      description: 'Investigate a suspicious startup company claiming breakthrough technology.',
      target: {
        companyName: 'QuantumTech Solutions',
        founded: '2023',
        employees: [
          {
            title: 'CEO',
            background: 'Claims 20 years quantum computing experience',
            education: 'Lists unverifiable credentials'
          },
          {
            title: 'CTO',
            background: 'No technical publications',
            connections: '50+'
          }
        ],
        companyDetails: {
          location: 'Multiple conflicting addresses',
          funding: '$50M claimed seed round',
          product: 'Revolutionary quantum encryption'
        }
      }
    },
    objectives: [
      'Verify company legitimacy',
      'Check executive credentials',
      'Find inconsistencies in company claims'
    ],
    hints: [
      'Research executive background',
      'Verify company registration',
      'Check patent databases'
    ],
    acceptedAnswers: [
      'fraudulent',
      'fake company',
      'scam company',
      'shell company',
      'fraudulent startup',
      'fake startup',
      'not legitimate',
      'illegitimate'
    ],
    keywords: [
      'fraud',
      'fake',
      'scam',
      'shell',
      'illegitimate'
    ],
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    tutorial: `
# Corporate Intelligence Gathering

Verification steps:

1. Company Validation
   - Business registration records
   - Physical location verification
   - Employee count analysis

2. Executive Background
   - Academic verification
   - Publication history
   - Previous employment

3. Technology Claims
   - Patent searches
   - Scientific publications
   - Industry recognition
    `
  }
];

export function OsintGame() {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [showScenario, setShowScenario] = useState(true);
  const [consoleHistory, setConsoleHistory] = useState<string[]>([]);
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
    addToConsole('initialize_investigation', 'Starting OSINT investigation...');
  };

  const addToConsole = (command: string, output: string) => {
    setConsoleHistory(prev => [...prev, 
      `investigator@osint:~$ ${command}`,
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
      addToConsole('verify_findings', 'Investigation successful! Target information confirmed.');

      setTimeout(() => {
        if (currentChallenge < challenges.length - 1) {
          setCurrentChallenge(prev => prev + 1);
          setShowScenario(true);
          sounds.levelUp.play();
        } else {
          setFeedback('Congratulations! You\'ve completed all OSINT challenges!');
        }
      }, 2000);
    } else {
      sounds.error.play();
      setCombo(0);
      setFeedback('Investigation unsuccessful. Review your findings and try again.');
      addToConsole('verify_findings', 'Investigation inconclusive. Additional evidence needed.');
    }
  };

  const checkSolution = () => {
    const challenge = challenges[currentChallenge];
    const userInput = input.toLowerCase().trim();
    
    // Check for exact matches first
    if (challenge.acceptedAnswers.includes(userInput)) {
      endChallenge(true);
      return;
    }

    // Check for keyword matches
    const hasKeywords = challenge.keywords.some(keyword => 
      userInput.includes(keyword.toLowerCase())
    );

    // Check for semantic similarity with accepted answers
    const hasAcceptedPhrases = challenge.acceptedAnswers.some(answer =>
      userInput.includes(answer.toLowerCase()) || 
      answer.toLowerCase().includes(userInput)
    );

    if (hasKeywords && hasAcceptedPhrases) {
      endChallenge(true);
    } else {
      // Add more specific feedback about what might be missing
      addToConsole('analyze_response', 'Response analysis: Some relevant information found, but more specific details needed.');
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
              alt="Investigation Scenario"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
              <Search className="w-12 h-12 text-indigo-500 mr-4" />
              <div className="text-left">
                <h2 className="text-2xl font-bold text-white mb-2">{challenge.scenario.title}</h2>
                <p className="text-gray-300">{challenge.scenario.description}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-black/50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Mission Objectives</h3>
              <ul className="space-y-2">
                {challenge.objectives.map((objective, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-2" />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-black/50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Target Information</h3>
              <div className="space-y-2 text-left">
                {Object.entries(challenge.scenario.target).map(([key, value]) => (
                  <div key={key} className="flex items-start">
                    {key === 'username' && <User className="w-5 h-5 text-indigo-500 mr-2 mt-1" />}
                    {key === 'platform' && <Globe className="w-5 h-5 text-indigo-500 mr-2 mt-1" />}
                    {key === 'location' && <MapPin className="w-5 h-5 text-indigo-500 mr-2 mt-1" />}
                    <div>
                      <span className="text-gray-400">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                      <span className="text-gray-300 ml-2">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={startChallenge}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors transform hover:scale-105"
          >
            Begin Investigation
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
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className="bg-black rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Target Profile
                </span>
              </div>
              <pre className="text-green-500 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(challenge.scenario.target, null, 2)}
              </pre>
            </div>

            <div className="mb-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <textarea
                  value={input}
                  onChange={handleInput}
                  className="w-full bg-gray-900 text-green-500 p-4 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={4}
                  placeholder="Enter your investigation findings..."
                />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <button
                onClick={checkSolution}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <FileSearch className="w-5 h-5 mr-2" />
                Submit Findings
              </button>
              <button
                onClick={() => setShowHint(!showHint)}
                className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                {showHint ? 'Hide Hints' : 'Show Hints'}
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
                  <span className="font-medium">Investigation Hints:</span>
                </div>
                <ul className="space-y-2">
                  {challenge.hints.map((hint, index) => (
                    <li key={index} className="text-blue-300 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showTutorial && (
              <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{challenge.tutorial}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="bg-[#1E1E1E] rounded-lg p-4 h-[600px] overflow-y-auto font-mono">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="flex items-center">
                  <Terminal className="w-4 h-4 mr-2" />
                  Investigation Console
                </span>
              </div>
              <div className="text-green-500">
                {consoleHistory.map((line, index) => (
                  <div key={index} className={line.startsWith('investigator@osint') ? 'text-blue-400' : 'text-gray-400'}>
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
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Combo x{combo}
            </div>
          )}
        </div>
        <div className="text-indigo-500 font-bold text-xl">
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