import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Courses } from './pages/Courses';
import { Leaderboard } from './pages/Leaderboard';
import { HandsOnLabs } from './pages/HandsOnLabs';
import { CTFChallenges } from './pages/CTFChallenges';
import { Auth } from './pages/Auth';
import { QuickGame } from './pages/QuickGame';
import { QuickTest } from './pages/QuickTest';
import { Roadmap } from './pages/Roadmap';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Theme } from './types';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <Header theme={theme} onToggleTheme={toggleTheme} />
          <main>
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/labs" element={<HandsOnLabs />} />
              <Route path="/ctf" element={<CTFChallenges />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/quick-game" element={<QuickGame />} />
              <Route path="/quick-test" element={<QuickTest />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;