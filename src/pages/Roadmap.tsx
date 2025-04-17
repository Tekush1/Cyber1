import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Sword, 
  Skull, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Trophy,
  Target,
  Laptop,
  Network,
  Terminal,
  Globe,
  Bug,
  Key,
  Search,
  Lock,
  Wifi,
  Cloud,
  Users,
  Zap,
  Award,
  BookOpen,
  Star,
  Timer,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface RoadmapSection {
  id: string;
  title: string;
  icon: React.ElementType;
  topics: {
    title: string;
    items: Array<{
      name: string;
      completed?: boolean;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      estimatedTime: string;
      resources?: Array<{
        title: string;
        url: string;
      }>;
    }>;
  }[];
}

const roadmapData: { 
  level: string;
  icon: React.ElementType;
  description: string;
  color: string;
  sections: RoadmapSection[];
}[] = [
  {
    level: "Beginner Level",
    icon: Shield,
    description: "Cybersecurity Fundamentals",
    color: "green",
    sections: [
      {
        id: "intro",
        title: "Introduction to Cybersecurity",
        icon: Shield,
        topics: [{
          title: "Core Concepts",
          items: [
            {
              name: "What is Cybersecurity?",
              difficulty: "beginner",
              estimatedTime: "30 mins",
              resources: [
                { title: "NIST Cybersecurity Framework", url: "https://www.nist.gov/cyberframework" },
                { title: "Introduction to Cybersecurity", url: "https://www.cybrary.it/course/intro-to-cyber-security" }
              ]
            },
            {
              name: "History of Cyber Attacks",
              difficulty: "beginner",
              estimatedTime: "1 hour",
              resources: [
                { title: "Notable Cyber Attacks", url: "https://www.csoonline.com/article/2130877/the-biggest-data-breaches-of-the-21st-century.html" }
              ]
            },
            {
              name: "Ethical Hacking vs. Black Hat Hacking",
              difficulty: "beginner",
              estimatedTime: "45 mins"
            },
            {
              name: "Cyber Laws and Compliance",
              difficulty: "intermediate",
              estimatedTime: "2 hours"
            }
          ]
        }]
      },
      {
        id: "networks",
        title: "Understanding Computer Networks",
        icon: Network,
        topics: [{
          title: "Network Fundamentals",
          items: [
            {
              name: "TCP/IP Protocol Suite",
              difficulty: "beginner",
              estimatedTime: "2 hours",
              resources: [
                { title: "TCP/IP Guide", url: "http://www.tcpipguide.com/" }
              ]
            },
            {
              name: "IP Addressing & Subnetting",
              difficulty: "intermediate",
              estimatedTime: "3 hours"
            },
            {
              name: "Network Security Devices",
              difficulty: "intermediate",
              estimatedTime: "2 hours"
            }
          ]
        }]
      }
    ]
  },
  {
    level: "Intermediate Level",
    icon: Sword,
    description: "Offensive & Defensive Security",
    color: "yellow",
    sections: [
      {
        id: "webapp",
        title: "Web Application Security & Bug Bounty",
        icon: Bug,
        topics: [{
          title: "Web Security",
          items: [
            {
              name: "SQL Injection (SQLi)",
              difficulty: "intermediate",
              estimatedTime: "4 hours"
            },
            {
              name: "Cross-Site Scripting (XSS)",
              difficulty: "intermediate",
              estimatedTime: "3 hours"
            },
            {
              name: "Cross-Site Request Forgery (CSRF)",
              difficulty: "intermediate",
              estimatedTime: "2 hours"
            },
            {
              name: "Remote Code Execution (RCE)",
              difficulty: "advanced",
              estimatedTime: "4 hours"
            },
            {
              name: "File Upload Vulnerabilities",
              difficulty: "intermediate",
              estimatedTime: "2 hours"
            },
            {
              name: "Using Burp Suite for Web Testing",
              difficulty: "intermediate",
              estimatedTime: "5 hours"
            }
          ]
        }]
      }
    ]
  },
  {
    level: "Advanced Level",
    icon: Skull,
    description: "Red Teaming & Advanced Pentesting",
    color: "red",
    sections: [
      {
        id: "advanced-web",
        title: "Advanced Web Hacking Techniques",
        icon: Globe,
        topics: [{
          title: "Advanced Techniques",
          items: [
            {
              name: "Exploiting Authentication Mechanisms",
              difficulty: "advanced",
              estimatedTime: "6 hours"
            },
            {
              name: "SSRF (Server-Side Request Forgery)",
              difficulty: "advanced",
              estimatedTime: "4 hours"
            },
            {
              name: "Advanced Burp Suite Techniques",
              difficulty: "advanced",
              estimatedTime: "8 hours"
            },
            {
              name: "Bypassing WAF (Web Application Firewall)",
              difficulty: "advanced",
              estimatedTime: "6 hours"
            }
          ]
        }]
      }
    ]
  }
];

export function Roadmap() {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, boolean>>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  const fetchUserProgress = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('completed_courses')
        .eq('id', user?.id)
        .single();

      if (data?.completed_courses) {
        const progress = data.completed_courses.reduce((acc: Record<string, boolean>, courseId: string) => {
          acc[courseId] = true;
          return acc;
        }, {});
        setUserProgress(progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const markAsCompleted = async (itemId: string) => {
    if (!user) return;

    try {
      const newProgress = { ...userProgress, [itemId]: !userProgress[itemId] };
      setUserProgress(newProgress);

      await supabase
        .from('profiles')
        .update({
          completed_courses: Object.keys(newProgress).filter(key => newProgress[key])
        })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const filteredRoadmapData = roadmapData.map(level => ({
    ...level,
    sections: level.sections.map(section => ({
      ...section,
      topics: section.topics.map(topic => ({
        ...topic,
        items: topic.items.filter(item => {
          const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesDifficulty = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;
          return matchesSearch && matchesDifficulty;
        })
      })).filter(topic => topic.items.length > 0)
    })).filter(section => section.topics.some(topic => topic.items.length > 0))
  })).filter(level => level.sections.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-red-500 to-white">
            Cybersecurity Learning Roadmap
          </h1>
          <p className="text-gray-400">Your path to becoming a cybersecurity expert</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedDifficulty === difficulty
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          {filteredRoadmapData.map((level, levelIndex) => (
            <div key={level.level} className="relative">
              {levelIndex < roadmapData.length - 1 && (
                <div className="absolute left-6 top-20 bottom-0 w-0.5 bg-gradient-to-b from-gray-700 to-transparent"></div>
              )}
              
              <div className="relative z-10">
                <div className={`inline-flex items-center space-x-3 mb-6 px-4 py-2 rounded-full bg-${level.color}-900/30 border border-${level.color}-700`}>
                  <level.icon className={`w-6 h-6 text-${level.color}-500`} />
                  <span className="text-xl font-bold text-white">{level.level}</span>
                  <span className="text-gray-400">- {level.description}</span>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {level.sections.map(section => (
                    <div
                      key={section.id}
                      className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 overflow-hidden hover:border-red-500 transition-all duration-300"
                    >
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-4 flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-3">
                          <section.icon className="w-5 h-5 text-red-500 group-hover:animate-pulse" />
                          <h3 className="font-semibold text-white">{section.title}</h3>
                        </div>
                        {expandedSections.includes(section.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {expandedSections.includes(section.id) && (
                        <div className="px-4 pb-4">
                          {section.topics.map((topic, topicIndex) => (
                            <div key={topicIndex} className="mt-2">
                              <h4 className="text-sm font-medium text-gray-400 mb-2">
                                {topic.title}
                              </h4>
                              <ul className="space-y-2">
                                {topic.items.map((item, itemIndex) => {
                                  const itemId = `${section.id}-${topicIndex}-${itemIndex}`;
                                  return (
                                    <li
                                      key={itemIndex}
                                      className="relative group"
                                      onMouseEnter={() => setActiveTooltip(itemId)}
                                      onMouseLeave={() => setActiveTooltip(null)}
                                    >
                                      <div className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                                        <div className="flex items-center space-x-2">
                                          <button
                                            onClick={() => markAsCompleted(itemId)}
                                            className={`w-5 h-5 rounded-full border ${
                                              userProgress[itemId]
                                                ? 'bg-green-500 border-green-600'
                                                : 'border-gray-600 hover:border-green-500'
                                            } flex items-center justify-center transition-colors`}
                                          >
                                            {userProgress[itemId] && (
                                              <CheckCircle2 className="w-4 h-4 text-white" />
                                            )}
                                          </button>
                                          <span className="text-gray-300">{item.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm">
                                          <span className={`px-2 py-1 rounded-full text-xs ${
                                            item.difficulty === 'beginner' ? 'bg-green-900/50 text-green-400' :
                                            item.difficulty === 'intermediate' ? 'bg-yellow-900/50 text-yellow-400' :
                                            'bg-red-900/50 text-red-400'
                                          }`}>
                                            {item.difficulty}
                                          </span>
                                          <span className="text-gray-500 flex items-center">
                                            <Timer className="w-4 h-4 mr-1" />
                                            {item.estimatedTime}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Tooltip */}
                                      {activeTooltip === itemId && item.resources && (
                                        <div className="absolute z-10 w-64 p-4 mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                                          <h5 className="font-medium text-white mb-2">Resources:</h5>
                                          <ul className="space-y-1">
                                            {item.resources.map((resource, idx) => (
                                              <li key={idx}>
                                                <a
                                                  href={resource.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                                                >
                                                  <BookOpen className="w-4 h-4 mr-1" />
                                                  {resource.title}
                                                </a>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Section */}
        <div className="mt-12 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
              Your Progress
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-1" />
                <span className="text-yellow-500">
                  {Object.values(userProgress).filter(Boolean).length} completed
                </span>
              </div>
              <div className="flex items-center">
                <Target className="w-5 h-5 text-blue-500 mr-1" />
                <span className="text-blue-500">
                  {Object.keys(userProgress).length} total
                </span>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Object.values(userProgress).filter(Boolean).length / Object.keys(userProgress).length * 100}%`
              }}
            />
          </div>
        </div>

        {/* Achievement Section */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-900/30 border border-green-700">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="text-green-100">Keep going! You're making great progress!</span>
          </div>
        </div>
      </div>
    </div>
  );
}