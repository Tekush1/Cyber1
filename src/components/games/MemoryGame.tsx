import React, { useState, useEffect } from 'react';
import { Shield, Bug, Lock, Key, Wifi, Database, Cloud, Server, Terminal, Globe, Laptop, Network, AlertTriangle, FileKey2, Fingerprint, Brush as Virus } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const ICONS = [
  { icon: Shield, name: 'Shield', description: 'Network Defense' },
  { icon: Bug, name: 'Bug', description: 'Vulnerability' },
  { icon: Lock, name: 'Lock', description: 'Encryption' },
  { icon: Key, name: 'Key', description: 'Authentication' },
  { icon: Wifi, name: 'Wifi', description: 'Wireless Security' },
  { icon: Database, name: 'Database', description: 'Data Protection' },
  { icon: Cloud, name: 'Cloud', description: 'Cloud Security' },
  { icon: Server, name: 'Server', description: 'Server Security' },
  { icon: Terminal, name: 'Terminal', description: 'Command Line' },
  { icon: Globe, name: 'Globe', description: 'Web Security' },
  { icon: Laptop, name: 'Laptop', description: 'Endpoint Security' },
  { icon: Network, name: 'Network', description: 'Network Protocol' },
  { icon: AlertTriangle, name: 'Alert', description: 'Threat Detection' },
  { icon: FileKey2, name: 'FileKey', description: 'File Encryption' },
  { icon: Fingerprint, name: 'Fingerprint', description: 'Biometrics' },
  { icon: Virus, name: 'Virus', description: 'Malware Analysis' }
];

interface Card {
  id: number;
  icon: typeof Shield;
  name: string;
  description: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [showTutorial, setShowTutorial] = useState(true);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);

  const difficultySettings = {
    easy: { pairs: 6, timeLimit: 120 },
    medium: { pairs: 8, timeLimit: 180 },
    hard: { pairs: 12, timeLimit: 240 }
  };

  useEffect(() => {
    if (difficulty) {
      initializeGame();
    }
  }, [difficulty]);

  const initializeGame = () => {
    const pairs = difficultySettings[difficulty].pairs;
    const selectedIcons = [...ICONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, pairs);
    
    const duplicatedIcons = [...selectedIcons, ...selectedIcons];
    const shuffledCards = duplicatedIcons
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: index,
        icon: item.icon,
        name: item.name,
        description: item.description,
        isFlipped: false,
        isMatched: false
      }));

    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameOver(false);
    setCombo(0);
    setScore(0);
  };

  const handleCardClick = async (cardId: number) => {
    if (
      flippedCards.length === 2 ||
      cards[cardId].isFlipped ||
      cards[cardId].isMatched
    ) {
      return;
    }

    const newCards = [...cards];
    newCards[cardId].isFlipped = true;
    setCards(newCards);
    setFlippedCards([...flippedCards, cardId]);

    if (flippedCards.length === 1) {
      setMoves(moves + 1);
      const [firstCard] = flippedCards;
      
      if (cards[firstCard].name === cards[cardId].name) {
        // Match found
        newCards[firstCard].isMatched = true;
        newCards[cardId].isMatched = true;
        setCards(newCards);
        setFlippedCards([]);
        setMatches(matches + 1);
        
        // Update combo and score
        const newCombo = combo + 1;
        setCombo(newCombo);
        const comboBonus = Math.floor(newCombo / 3) * 50;
        setScore(score + 100 + comboBonus);

        if (matches + 1 === difficultySettings[difficulty].pairs) {
          setGameOver(true);
          // Update user's score in Supabase
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const finalScore = score + 100 + comboBonus;
              await supabase
                .from('profiles')
                .update({ 
                  points: finalScore,
                  level: finalScore > 800 ? 'advanced' : finalScore > 400 ? 'intermediate' : 'beginner'
                })
                .eq('id', user.id);
            }
          } catch (error) {
            console.error('Error updating score:', error);
          }
        }
      } else {
        // No match
        setCombo(0);
        setTimeout(() => {
          newCards[firstCard].isFlipped = false;
          newCards[cardId].isFlipped = false;
          setCards(newCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  if (showTutorial) {
    return (
      <div className="max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800">
        <h2 className="text-2xl font-bold mb-6">How to Play Memory Match</h2>
        <div className="space-y-4 mb-8">
          <p className="text-gray-300">🎯 Match pairs of cybersecurity concepts</p>
          <p className="text-gray-300">🏆 Build combos for bonus points</p>
          <p className="text-gray-300">⚡ Complete the game before time runs out</p>
          <p className="text-gray-300">📚 Learn about security tools and concepts</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(difficultySettings).map(([level, settings]) => (
            <button
              key={level}
              onClick={() => {
                setDifficulty(level as 'easy' | 'medium' | 'hard');
                setShowTutorial(false);
              }}
              className={`p-4 rounded-lg transition-colors ${
                level === 'easy' ? 'bg-green-600 hover:bg-green-700' :
                level === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' :
                'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              <div className="font-bold mb-2">{level.charAt(0).toUpperCase() + level.slice(1)}</div>
              <div className="text-sm">
                {settings.pairs} pairs • {settings.timeLimit}s
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div className="text-gray-300">Moves: {moves}</div>
        <div className="text-gray-300">Matches: {matches}/{difficultySettings[difficulty].pairs}</div>
        <div className="text-yellow-500">Combo: x{combo}</div>
        <div className="text-green-500">Score: {score}</div>
        <button
          onClick={initializeGame}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reset Game
        </button>
      </div>

      <div className={`grid gap-4 ${
        difficulty === 'easy' ? 'grid-cols-3 md:grid-cols-4' :
        difficulty === 'medium' ? 'grid-cols-4 md:grid-cols-4' :
        'grid-cols-4 md:grid-cols-6'
      }`}>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square p-4 rounded-xl transition-all duration-300 transform ${
              card.isFlipped || card.isMatched
                ? 'bg-gray-800 rotate-0'
                : 'bg-gray-900 hover:bg-gray-800 rotate-180'
            }`}
            disabled={card.isMatched}
          >
            {(card.isFlipped || card.isMatched) && (
              <div className="flex flex-col items-center justify-center h-full">
                <card.icon className="w-8 h-8 mb-2 text-green-500" />
                <div className="text-xs text-center">
                  <div className="font-bold mb-1">{card.name}</div>
                  <div className="text-gray-400">{card.description}</div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {gameOver && (
        <div className="mt-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Game Complete!
          </h3>
          <p className="text-gray-400 mb-4">
            You completed the game in {moves} moves
          </p>
          <div className="mb-4">
            <div className="text-lg">Final Score: {score}</div>
            <div className="text-sm text-gray-400">
              Highest Combo: x{combo}
            </div>
          </div>
          <button
            onClick={() => {
              setShowTutorial(true);
              setGameOver(false);
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}