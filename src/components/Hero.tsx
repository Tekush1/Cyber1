import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Terminal, 
  Award, 
  Skull, 
  Crown, 
  Star, 
  Users, 
  Zap, 
  Monitor, 
  Eye, 
  Bug, 
  Binary 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const fsocietyImages = [
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', // Dark binary/matrix
  'https://images.unsplash.com/photo-1563206767-5b18f218e8de', // Hacker mask
  'https://images.unsplash.com/photo-1614064641938-3bbee52942c7', // Dark tech
  'https://images.unsplash.com/photo-1526374870839-e155464bb9b2', // Circuit board
  'https://images.unsplash.com/photo-1633259584604-afdc243122ea', // Dark tech grid
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713', // Code matrix
];

export function Hero() {
  const { user } = useAuth();
  const [glitchText, setGlitchText] = useState('Master Ethical Hacking');
  const [showGlitch, setShowGlitch] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBinaryEffect, setShowBinaryEffect] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeMobileFeature, setActiveMobileFeature] = useState<number | null>(null);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setShowGlitch(true);
      setTimeout(() => setShowGlitch(false), 200);
    }, 5000);

    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % fsocietyImages.length);
    }, 5000);

    const binaryInterval = setInterval(() => {
      setShowBinaryEffect(true);
      setTimeout(() => setShowBinaryEffect(false), 300);
    }, 3000);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(imageInterval);
      clearInterval(binaryInterval);
    };
  }, []);

  const features = [
   {
      title: 'EchoFrame',
      description: 'Master the Art of exploitation by A.I',
      icon: Eye,
      path: 'https://ember-forge-genesis-40.lovable.app/',
      image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7',
      color: 'blue'
    },
    {
      title: 'fsociety Labs',
      description: 'Join the revolution with real-world hacking environments',
      icon: Terminal,
      path: '/labs',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
      color: 'green'
    },
    {
      title: 'Dark Army Challenges',
      description: 'Elite hacking scenarios inspired by Mr. Robot',
      icon: Bug,
      path: '/ctf',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
      color: 'red'
    },
  
    {
      title: 'Live Operations',
      description: 'Real-time attack simulations',
      icon: Monitor,
      path: '/quick-game',
      image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de',
      color: 'purple'
    }
  ];

  const stats = [
    { value: '100+', label: 'Active Hackers', icon: Users },
    { value: '500+', label: 'Challenges', icon: Shield },
    { value: '24/7', label: 'Live Labs', icon: Terminal },
    { value: '98%', label: 'Success Rate', icon: Star }
  ];

  // Mobile touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeMobileFeature !== null) {
      setActiveMobileFeature((prev) => 
        prev === features.length - 1 ? 0 : (prev || 0) + 1
      );
    } else if (isRightSwipe && activeMobileFeature !== null) {
      setActiveMobileFeature((prev) => 
        prev === 0 ? features.length - 1 : (prev || 0) - 1
      );
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const renderFeatureLink = (feature: any) => {
    if (feature.path.startsWith('http')) {
      return (
        <a
          href={feature.path}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 hover:border-red-500 transition-all duration-300 hover:transform hover:scale-105 overflow-hidden"
        >
          {renderFeatureContent(feature)}
        </a>
      );
    }
    return (
      <Link
        to={feature.path}
        className="group relative bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 hover:border-red-500 transition-all duration-300 hover:transform hover:scale-105 overflow-hidden"
      >
        {renderFeatureContent(feature)}
      </Link>
    );
  };

  const renderFeatureContent = (feature: any) => (
    <>
      <div className="absolute inset-0 opacity-20">
        <img 
          src={feature.image} 
          alt="" 
          className="w-full h-full object-cover filter grayscale"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/95 to-gray-900"></div>
      
      <div className="relative z-10">
        <div className="absolute -top-4 -right-4">
          <span className={`inline-flex items-center justify-center p-3 bg-gradient-to-br from-${feature.color}-600 to-${feature.color}-800 rounded-xl shadow-lg group-hover:shadow-${feature.color}-500/30 transition-all duration-300`}>
            <feature.icon className="h-6 w-6 text-white" />
          </span>
        </div>
        
        {!user && feature.path !== '/quick-game' && (
          <Crown className="w-5 h-5 text-yellow-500 mb-2" />
        )}
        
        <h3 className="mt-8 text-xl font-bold text-white mb-2 font-mono">{feature.title}</h3>
        <p className="text-gray-400 font-mono">{feature.description}</p>
        
        <div className="mt-4 h-1 w-full bg-gray-800 overflow-hidden">
          <div className="h-full w-1/2 bg-red-500 animate-pulse"></div>
        </div>
      </div>
    </>
  );

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Dynamic Background with Fade Effect */}
      <div className="absolute inset-0 transition-opacity duration-1000">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${fsocietyImages[currentImageIndex]})`,
            opacity: 0.15
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
      </div>

      {/* Animated Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Matrix Rain Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="matrix-rain"></div>
      </div>

      {/* fsociety Logo Animation */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <div className={`transform transition-all duration-500 ${showBinaryEffect ? 'scale-110 opacity-70' : 'scale-100 opacity-30'}`}>
          <div className="relative">
            <Skull className="w-96 h-96 text-red-500" />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-red-500 opacity-50">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    transform: `rotate(${i * 18}deg) translateY(-120px)`,
                    animation: `pulse 2s ${i * 0.1}s infinite`
                  }}
                >
                  {Math.random() > 0.5 ? '1' : '0'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Mobile-optimized Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
              <div className="relative">
                <Skull className="w-12 h-12 text-red-500 animate-pulse" />
                <div className="absolute -top-2 -right-2 w-6 h-6 text-red-500 animate-spin-slow">
                  <div className="relative w-full h-full">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ transform: `rotate(${i * 45}deg)` }}
                      >
                        {i % 2 === 0 ? '1' : '0'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-mono font-extrabold ${
                showGlitch ? 'glitch-text' : 'bg-clip-text text-transparent bg-gradient-to-r from-white via-red-500 to-white'
              }`} data-text={glitchText}>
                {glitchText}
              </h1>
            </div>
            
            <div className="mt-6 font-mono">
              <p className="text-xl text-red-500 typewriter-text">&gt; Hello, friend...</p>
              <p className="text-lg md:text-xl text-gray-300 mt-4">
                Are you ready to join fsociety? Train in our underground labs and master the art of digital revolution.
              </p>
            </div>
            
            <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
              {user ? (
                <Link to="/roadmap" className="transform hover:scale-105 transition-all w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-mono shadow-lg hover:shadow-red-500/30 border border-red-700/50 relative overflow-hidden group">
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-600 to-red-800 animate-pulse opacity-0 group-hover:opacity-30 transition-opacity"></span>
                    <span className="relative">Continue Mission</span>
                  </button>
                </Link>
              ) : (
                <Link to="/auth" className="transform hover:scale-105 transition-all w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-mono shadow-lg hover:shadow-red-500/30 border border-red-700/50 relative overflow-hidden group">
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-600 to-red-800 animate-pulse opacity-0 group-hover:opacity-30 transition-opacity"></span>
                    <span className="relative">Initialize System</span>
                  </button>
                </Link>
              )}
            </div>

            {/* Mobile Stats Grid */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center transform hover:scale-105 transition-all p-4 bg-gray-900/30 rounded-lg backdrop-blur-sm">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500 blur-sm opacity-20 animate-pulse"></div>
                    <stat.icon className="w-8 h-8 text-red-500 mx-auto mb-2 relative z-10" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-red-500 font-mono">{stat.value}</div>
                  <div className="text-sm text-gray-400 font-mono">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile-optimized Feature Cards */}
          <div className="flex-1 w-full lg:w-auto mt-12 lg:mt-0">
            <div 
              className="relative overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Mobile Feature Carousel */}
              <div className="lg:hidden">
                <div className="flex justify-center gap-2 mb-4">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveMobileFeature(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        activeMobileFeature === index ? 'bg-red-500 w-4' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="relative">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className={`transform transition-all duration-300 ${
                        activeMobileFeature === index
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 translate-x-full absolute inset-0'
                      }`}
                    >
                      {feature.path.startsWith('http') ? (
                        <a
                          href={feature.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 hover:border-red-500 transition-all duration-300"
                        >
                          {renderFeatureContent(feature)}
                        </a>
                      ) : (
                        <Link
                          to={feature.path}
                          className="block bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 hover:border-red-500 transition-all duration-300"
                        >
                          {renderFeatureContent(feature)}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="text-center text-sm text-gray-500 mt-4">
                  Swipe to explore more features
                </div>
              </div>

              {/* Desktop Feature Grid */}
              <div className="hidden lg:grid grid-cols-2 gap-6">
                {features.map((feature, index) => renderFeatureLink(feature))}
              </div>
            </div>
          </div>
        </div>

        {/* Premium Banner - Mobile Optimized */}
        {!user && (
          <div className="mt-16 bg-gradient-to-r from-gray-900/90 to-red-900/90 border border-red-700/50 rounded-lg p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  <span className="absolute inset-0 bg-yellow-500 blur-md opacity-20 animate-pulse"></span>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold text-white font-mono">Join fsociety Elite</h3>
                  <p className="text-gray-300 font-mono">Access restricted operations and classified training modules</p>
                </div>
              </div>
              <Link
                to="/auth"
                className="w-full md:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 font-mono border border-red-500/30 relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-600 to-red-800 animate-pulse opacity-0 group-hover:opacity-30 transition-opacity"></span>
                <Zap className="w-5 h-5" />
                <span className="relative">Initiate Access</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}