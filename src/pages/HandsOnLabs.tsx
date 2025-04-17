import React, { useState } from 'react';
import { Terminal, Clock, PenTool as Tool, ChevronRight, Shield, Play, CheckCircle, Trophy, Target } from 'lucide-react';
import type { Lab } from '../types';
import { supabase } from '../lib/supabaseClient';

const labs: Lab[] = [
  {
    id: '1',
    title: 'Network Scanning Basics',
    description: 'Learn to use Nmap for network reconnaissance and port scanning.',
    difficulty: 'beginner',
    duration: '45 minutes',
    tools: ['Nmap', 'Wireshark'],
    category: 'Network Security',
    reward: 200,
    challenges: [
      {
        title: 'Basic Port Scan',
        description: 'Perform a basic TCP SYN scan',
        points: 50,
        hint: 'Use nmap -sS for SYN scan'
      },
      {
        title: 'Service Detection',
        description: 'Identify running services',
        points: 75,
        hint: 'Add -sV flag for version detection'
      },
      {
        title: 'OS Fingerprinting',
        description: 'Determine target OS',
        points: 75,
        hint: 'Use -O flag for OS detection'
      }
    ]
  },
  {
    id: '2',
    title: 'Web Application Testing',
    description: 'Practice identifying and exploiting common web vulnerabilities.',
    difficulty: 'intermediate',
    duration: '1 hour',
    tools: ['Burp Suite', 'OWASP ZAP'],
    category: 'Web Security',
    reward: 300,
    challenges: [
      {
        title: 'SQL Injection',
        description: 'Find and exploit SQL injection vulnerability',
        points: 100,
        hint: 'Try single quotes in input fields'
      },
      {
        title: 'XSS Detection',
        description: 'Identify Cross-Site Scripting vulnerabilities',
        points: 100,
        hint: 'Test with <script> tags'
      },
      {
        title: 'CSRF Testing',
        description: 'Test for Cross-Site Request Forgery',
        points: 100,
        hint: 'Check for CSRF tokens'
      }
    ]
  },
  {
    id: '3',
    title: 'Malware Analysis Lab',
    description: 'Analyze malicious software in a controlled environment.',
    difficulty: 'advanced',
    duration: '2 hours',
    tools: ['IDA Pro', 'Ghidra'],
    category: 'Malware Analysis',
    reward: 500,
    challenges: [
      {
        title: 'Static Analysis',
        description: 'Perform static analysis of malware sample',
        points: 150,
        hint: 'Look for suspicious strings and imports'
      },
      {
        title: 'Dynamic Analysis',
        description: 'Analyze malware behavior in sandbox',
        points: 175,
        hint: 'Monitor network connections and file operations'
      },
      {
        title: 'Reverse Engineering',
        description: 'Reverse engineer key functions',
        points: 175,
        hint: 'Focus on main function and crypto routines'
      }
    ]
  }
];

export function HandsOnLabs() {
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [activeChallengeIndex, setActiveChallengeIndex] = useState<number>(-1);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);

  const handleChallenge = async (labId: string, challengeIndex: number) => {
    const challengeId = `${labId}-${challengeIndex}`;
    if (completedChallenges.includes(challengeId)) return;

    const lab = labs.find(l => l.id === labId);
    if (!lab) return;

    const challenge = lab.challenges[challengeIndex];
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            points: challenge.points,
            level: challenge.points > 150 ? 'advanced' : challenge.points > 75 ? 'intermediate' : 'beginner'
          })
          .eq('id', user.id);

        setCompletedChallenges([...completedChallenges, challengeId]);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Hands-On Labs</h1>
          <p className="text-gray-400">Practice real-world cybersecurity skills in our secure environment</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {labs.map((lab) => (
            <div key={lab.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-green-500 transition-colors">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${lab.difficulty === 'beginner' ? 'bg-green-900 text-green-200' :
                      lab.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-200' :
                      'bg-red-900 text-red-200'}`}>
                    {lab.difficulty.charAt(0).toUpperCase() + lab.difficulty.slice(1)}
                  </span>
                  <div className="flex items-center text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">{lab.duration}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">{lab.title}</h3>
                <p className="text-gray-400 mb-4">{lab.description}</p>

                <div className="space-y-2 mb-6">
                  <div className="text-gray-400 mb-2">Required Tools:</div>
                  {lab.tools.map((tool, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <Tool className="w-4 h-4 mr-2 text-green-500" />
                      <span>{tool}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-yellow-500">{lab.reward} pts</span>
                  </div>
                  <button
                    onClick={() => setSelectedLab(lab)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    Start Lab
                    <Terminal className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>

              {selectedLab?.id === lab.id && (
                <div className="border-t border-gray-800 p-6">
                  <h4 className="text-lg font-semibold mb-4">Lab Challenges</h4>
                  <div className="space-y-4">
                    {lab.challenges.map((challenge, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${
                          activeChallengeIndex === index
                            ? 'bg-gray-800 border border-green-500'
                            : 'bg-gray-800/50'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium">{challenge.title}</h5>
                          <div className="flex items-center">
                            <Target className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-yellow-500">{challenge.points} pts</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{challenge.description}</p>
                        
                        {activeChallengeIndex === index && (
                          <div className="mt-2 p-2 bg-gray-900 rounded text-sm">
                            <span className="text-blue-400">Hint:</span> {challenge.hint}
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-3">
                          <button
                            onClick={() => setActiveChallengeIndex(
                              activeChallengeIndex === index ? -1 : index
                            )}
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
                            {activeChallengeIndex === index ? 'Hide Details' : 'Show Details'}
                          </button>
                          
                          {completedChallenges.includes(`${lab.id}-${index}`) ? (
                            <div className="flex items-center text-green-500">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Completed
                            </div>
                          ) : (
                            <button
                              onClick={() => handleChallenge(lab.id, index)}
                              className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            >
                              Start Challenge
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}