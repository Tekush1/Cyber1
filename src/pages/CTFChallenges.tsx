import React, { useState } from 'react';
import { Flag, Lock, Award, ChevronRight, Shield } from 'lucide-react';
import type { Challenge } from '../types';

const challenges: Challenge[] = [
  {
    id: '1',
    title: 'Hidden Flag',
    description: 'Find the hidden flag in the website source code.',
    difficulty: 'easy',
    points: 100,
    category: 'Web',
    solved: false
  },
  {
    id: '2',
    title: 'Broken Authentication',
    description: 'Bypass the login mechanism to access admin panel.',
    difficulty: 'medium',
    points: 250,
    category: 'Web Security',
    solved: false
  },
  {
    id: '3',
    title: 'Packet Analysis',
    description: 'Analyze network traffic to find the secret message.',
    difficulty: 'hard',
    points: 500,
    category: 'Network',
    solved: false
  }
];

export function CTFChallenges() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', ...new Set(challenges.map(c => c.category))];
  
  const filteredChallenges = activeCategory === 'all' 
    ? challenges 
    : challenges.filter(c => c.category === activeCategory);

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">CTF Challenges</h1>
          <p className="text-gray-400">Test your skills with our capture the flag challenges</p>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg ${
                activeCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredChallenges.map((challenge) => (
            <div key={challenge.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-green-500 transition-colors">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${challenge.difficulty === 'easy' ? 'bg-green-900 text-green-200' :
                      challenge.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                      'bg-red-900 text-red-200'}`}>
                    {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                  </span>
                  <div className="flex items-center text-gray-400">
                    <Award className="w-4 h-4 mr-1" />
                    <span className="text-sm">{challenge.points} pts</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                <p className="text-gray-400 mb-4">{challenge.description}</p>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-400">{challenge.category}</span>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
                    {challenge.solved ? (
                      <>
                        Solved
                        <Flag className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Start Challenge
                        <Lock className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}