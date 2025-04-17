import React, { useState } from 'react';
import { 
  Terminal, 
  RefreshCw, 
  Brain, 
  Key, 
  Keyboard, 
  Shield, 
  Globe, 
  FileSearch, 
  Cpu, 
  Search, 
  Wrench,
  Puzzle,
  Binary,
  FileText
} from 'lucide-react';
import { MemoryGame } from '../components/games/MemoryGame';
import { CommandGame } from '../components/games/CommandGame';
import { TypingGame } from '../components/games/TypingGame';
import { CipherGame } from '../components/games/CipherGame';
import { WebGame } from '../components/games/WebGame';
import { ReverseGame } from '../components/games/ReverseGame';
import { PwnGame } from '../components/games/PwnGame';
import { ForensicsGame } from '../components/games/ForensicsGame';
import { OsintGame } from '../components/games/OsintGame';
import { HardwareGame } from '../components/games/HardwareGame';
import { MiscGame } from '../components/games/MiscGame';
import { LogAnalysisGame } from '../components/games/LogAnalysisGame';

export function QuickGame() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    {
      id: 'crypto',
      title: 'Cryptography',
      description: 'Break ciphers and decode encrypted messages',
      icon: Key,
      component: CipherGame,
      color: 'purple'
    },
    {
      id: 'web',
      title: 'Web Security',
      description: 'Exploit web vulnerabilities and secure applications',
      icon: Globe,
      component: WebGame,
      color: 'blue'
    },
    {
      id: 'reverse',
      title: 'Reverse Engineering',
      description: 'Analyze and understand compiled programs',
      icon: Binary,
      component: ReverseGame,
      color: 'green'
    },
    {
      id: 'pwn',
      title: 'Binary Exploitation',
      description: 'Exploit buffer overflows and memory corruption',
      icon: Shield,
      component: PwnGame,
      color: 'red'
    },
    {
      id: 'forensics',
      title: 'Digital Forensics',
      description: 'Investigate digital evidence and recover data',
      icon: FileSearch,
      component: ForensicsGame,
      color: 'yellow'
    },
    {
      id: 'osint',
      title: 'OSINT',
      description: 'Gather intelligence from open sources',
      icon: Search,
      component: OsintGame,
      color: 'indigo'
    },
    {
      id: 'hardware',
      title: 'Hardware Security',
      description: 'Hack embedded systems and IoT devices',
      icon: Cpu,
      component: HardwareGame,
      color: 'orange'
    },
    {
      id: 'misc',
      title: 'Miscellaneous',
      description: 'Solve various unique security challenges',
      icon: Puzzle,
      component: MiscGame,
      color: 'pink'
    },
    {
      id: 'memory',
      title: 'Cyber Memory',
      description: 'Match security tools and concepts',
      icon: Brain,
      component: MemoryGame,
      color: 'blue'
    },
    {
      id: 'command',
      title: 'Command Master',
      description: 'Learn essential security commands',
      icon: Terminal,
      component: CommandGame,
      color: 'green'
    },
    {
      id: 'typing',
      title: 'Speed Hacker',
      description: 'Type commands at lightning speed',
      icon: Keyboard,
      component: TypingGame,
      color: 'red'
    },
    {
      id: 'logs',
      title: 'Log Analysis',
      description: 'Analyze system logs to detect intrusions',
      icon: FileText,
      component: LogAnalysisGame,
      color: 'blue'
    }
  ];

  const GameComponent = selectedGame 
    ? games.find(g => g.id === selectedGame)?.component 
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-red-500 to-white">
            Hacker Training Games
          </h1>
          <p className="text-gray-400">Challenge yourself with our comprehensive cybersecurity challenges</p>
        </div>

        {!selectedGame ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`group bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800 hover:border-${game.color}-500 transition-all duration-300 hover:transform hover:scale-105`}
              >
                <game.icon className={`w-12 h-12 text-${game.color}-500 mb-4 group-hover:animate-pulse`} />
                <h3 className="text-2xl font-bold text-white mb-2">{game.title}</h3>
                <p className="text-gray-400">{game.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedGame(null)}
              className="mb-8 text-red-500 hover:text-red-400 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Choose Another Challenge
            </button>
            {GameComponent && <GameComponent />}
          </div>
        )}
      </div>
    </div>
  );
}