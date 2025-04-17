import React, { useState, useEffect } from 'react';
import { 
  Skull, 
  Trophy, 
  BookOpen, 
  Flag, 
  Terminal, 
  GamepadIcon, 
  Brain, 
  Menu, 
  X,
  Map,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Home,
  Bell,
  Crown,
  ChevronRight,
  Shield,
  Sparkles,
  Zap,
  Lock
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Theme } from '../types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  description?: string;
  isPremium?: boolean;
}

const premiumFeatures = [
  {
    title: 'Learning Path',
    path: '/roadmap',
    icon: Map,
    description: 'Structured cybersecurity learning journey',
    color: 'blue'
  },
  {
    title: 'Advanced Courses',
    path: '/courses',
    icon: BookOpen,
    description: 'In-depth cybersecurity training',
    color: 'green'
  },
  {
    title: 'Hands-on Labs',
    path: '/labs',
    icon: Terminal,
    description: 'Real-world practice environments',
    color: 'yellow'
  },
  {
    title: 'CTF Challenges',
    path: '/ctf',
    icon: Flag,
    description: 'Capture the flag competitions',
    color: 'red'
  }
];

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  const navItems: NavItem[] = [
    {
      path: '/',
      label: 'Home',
      icon: Home,
      description: 'Return to homepage'
    },
    {
      path: '/quick-game',
      label: 'Games',
      icon: GamepadIcon,
      description: 'Fun challenges'
    },
    {
      path: '/quick-test',
      label: 'Test',
      icon: Brain,
      description: 'Test your knowledge'
    },
    {
      path: '/leaderboard',
      label: 'Rankings',
      icon: Trophy,
      description: 'Global rankings'
    }
  ];

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    setIsPremiumOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (!target.closest('#mobile-menu') && !target.closest('#menu-button')) {
        setIsMenuOpen(false);
      }
      
      if (!target.closest('#profile-menu') && !target.closest('#profile-button')) {
        setIsProfileOpen(false);
      }
      
      if (!target.closest('#notifications-menu') && !target.closest('#notifications-button')) {
        setIsNotificationsOpen(false);
      }

      if (!target.closest('#premium-menu') && !target.closest('#premium-button')) {
        setIsPremiumOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handlePremiumClick = (e: React.MouseEvent, path: string) => {
    if (!user) {
      e.preventDefault();
      navigate('/auth');
    } else {
      navigate(path);
      setIsPremiumOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md shadow-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-2 group transition-transform duration-300 hover:scale-105"
          >
            <Skull className="w-8 h-8 text-red-500 animate-pulse" />
            <span className="text-xl font-bold text-white hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-white via-red-500 to-white">
              CyberEdu
            </span>
          </Link>
          
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link px-4 py-2 rounded-lg group relative transition-all duration-300 hover:scale-105 ${
                  location.pathname === item.path ? 'active' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:rotate-12`} />
                  <span>{item.label}</span>
                </div>
                {item.description && (
                  <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gray-900 text-white text-sm py-2 px-3 rounded-lg shadow-lg -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-50 animate-slideUp">
                    {item.description}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 border-8 border-transparent border-b-gray-900" />
                  </div>
                )}
              </Link>
            ))}

            {/* Premium Features Button */}
            <div className="relative">
              <button
                id="premium-button"
                onClick={() => setIsPremiumOpen(!isPremiumOpen)}
                className="nav-link px-4 py-2 rounded-lg group relative transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <Crown className="w-5 h-5 text-yellow-500" />
                <span>Premium</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isPremiumOpen ? 'rotate-180' : ''}`} />
                <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
              </button>

              {isPremiumOpen && (
                <div
                  id="premium-menu"
                  className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-lg shadow-lg py-1 border border-gray-800 transform transition-all duration-300 animate-slideDown"
                >
                  <div className="p-4 border-b border-gray-800">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
                      Premium Features
                    </h3>
                    <p className="text-sm text-gray-400">Unlock advanced cybersecurity training</p>
                  </div>
                  <div className="p-2">
                    {premiumFeatures.map((feature) => (
                      <button
                        key={feature.path}
                        onClick={(e) => handlePremiumClick(e, feature.path)}
                        className="w-full p-3 rounded-lg hover:bg-gray-800 transition-colors group flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg bg-${feature.color}-900/30 group-hover:bg-${feature.color}-900/50 transition-colors`}>
                            <feature.icon className={`w-5 h-5 text-${feature.color}-500`} />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-white">{feature.title}</div>
                            <div className="text-sm text-gray-400">{feature.description}</div>
                          </div>
                        </div>
                        {!user ? (
                          <Lock className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                        )}
                      </button>
                    ))}
                  </div>
                  {!user && (
                    <div className="p-4 border-t border-gray-800 bg-gradient-to-r from-yellow-900/30 to-red-900/30">
                      <Link
                        to="/auth"
                        className="w-full bg-gradient-to-r from-yellow-600 to-red-600 text-white py-2 px-4 rounded-lg hover:from-yellow-700 hover:to-red-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Unlock Premium</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />

            <button
              id="notifications-button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="nav-button p-2 rounded-lg hover:bg-gray-800 transition-all duration-300 hover:scale-105 relative"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {user ? (
              <div className="relative">
                <button
                  id="profile-button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="nav-button flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 transition-all duration-300 hover:scale-105"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-purple-500 flex items-center justify-center transform transition-transform duration-300 hover:rotate-12">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {isProfileOpen && (
                  <div
                    id="profile-menu"
                    className="dropdown-menu absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg py-1 border border-gray-800"
                  >
                    <div className="px-4 py-2 border-b border-gray-800">
                      <p className="text-sm font-medium text-white">Signed in as</p>
                      <p className="text-sm text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center group transition-all duration-300"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                      Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center group transition-all duration-300"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-90" />
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-800 text-left flex items-center group transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="nav-button bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-2 rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-300 hover:scale-105 animate-pulse"
              >
                Sign In
              </Link>
            )}
            
            <button
              id="menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden nav-button p-2 rounded-lg hover:bg-gray-800 transition-all duration-300 hover:scale-105"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-white transition-transform duration-300 rotate-90" />
              ) : (
                <Menu className="w-6 h-6 text-white transition-transform duration-300 hover:rotate-180" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav
            id="mobile-menu"
            className="lg:hidden py-4 space-y-1 absolute left-0 right-0 top-16 mobile-menu-backdrop border-b border-gray-800 animate-slideDown"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-link flex items-center justify-between p-4 ${
                  location.pathname === item.path ? 'active' : ''
                } transition-all duration-300 group`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            ))}

            {/* Mobile Premium Features */}
            <div className="p-4 space-y-2">
              <div className="flex items-center space-x-2 text-yellow-500 mb-2">
                <Crown className="w-5 h-5" />
                <span className="font-medium">Premium Features</span>
              </div>
              {premiumFeatures.map((feature) => (
                <button
                  key={feature.path}
                  onClick={(e) => handlePremiumClick(e, feature.path)}
                  className="w-full p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors group flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <feature.icon className={`w-5 h-5 text-${feature.color}-500`} />
                    <span className="text-gray-300">{feature.title}</span>
                  </div>
                  {!user ? (
                    <Lock className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
              ))}
              {!user && (
                <Link
                  to="/auth"
                  className="block w-full bg-gradient-to-r from-yellow-600 to-red-600 text-white py-2 px-4 rounded-lg hover:from-yellow-700 hover:to-red-700 transition-colors text-center mt-4"
                >
                  Unlock Premium Features
                </Link>
              )}
            </div>
          </nav>
        )}

        {isNotificationsOpen && (
          <div
            id="notifications-menu"
            className="dropdown-menu absolute right-0 mt-2 w-80 bg-gray-900 rounded-lg shadow-lg py-1 border border-gray-800"
            style={{ top: '4rem' }}
          >
            <div className="px-4 py-2 border-b border-gray-800">
              <h3 className="text-sm font-medium text-white">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="px-4 py-3 hover:bg-gray-800 cursor-pointer transition-colors duration-300 group">
                <p className="text-sm text-white group-hover:translate-x-1 transition-transform duration-300">
                  New course available: Advanced Web Security
                </p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
              <div className="px-4 py-3 hover:bg-gray-800 cursor-pointer transition-colors duration-300 group">
                <p className="text-sm text-white group-hover:translate-x-1 transition-transform duration-300">
                  You earned a new achievement!
                </p>
                <p className="text-xs text-gray-400">5 hours ago</p>
              </div>
            </div>
            <div className="px-4 py-2 border-t border-gray-800">
              <button className="text-sm text-blue-500 hover:text-blue-400 transition-colors duration-300">
                Mark all as read
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}