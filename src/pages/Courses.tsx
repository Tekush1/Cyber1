import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  Star, 
  ChevronRight, 
  Play, 
  CheckCircle, 
  Lock, 
  Trophy, 
  Target, 
  Brain, 
  Terminal,
  Shield,
  Zap,
  Crown,
  X,
  AlertCircle
} from 'lucide-react';
import type { Course } from '../types';
import { supabase } from '../lib/supabaseClient';

const courses = [
  {
    id: '1',
    title: 'Introduction to Cybersecurity',
    description: 'Learn the fundamentals of cybersecurity and basic security concepts.',
    level: 'beginner',
    duration: '4 weeks',
    reward: 1000,
    certification: 'Cybersecurity Fundamentals',
    instructor: 'Dr. Sarah Chen',
    instructorTitle: 'Senior Security Researcher',
    rating: 4.8,
    studentsEnrolled: 12500,
    lastUpdated: '2025-02-15',
    isPremium: false,
    requirements: [
      'Basic understanding of computer networks',
      'Familiarity with operating systems',
      'No prior security knowledge required'
    ],
    learningOutcomes: [
      'Understand core cybersecurity principles',
      'Identify common security threats',
      'Implement basic security measures',
      'Develop security-first mindset'
    ],
    modules: [
      {
        title: 'Security Basics',
        topics: [
          'What is Cybersecurity?',
          'CIA Triad',
          'Basic Security Terms',
          'Security Frameworks',
          'Risk Management Basics'
        ],
        duration: '1 week',
        completed: true,
        interactive: {
          type: 'quiz',
          reward: 100
        }
      },
      {
        title: 'Network Security',
        topics: [
          'Network Fundamentals',
          'Common Network Attacks',
          'Defense Strategies',
          'Firewall Configuration',
          'IDS/IPS Systems'
        ],
        duration: '1 week',
        completed: true,
        interactive: {
          type: 'lab',
          reward: 150
        }
      },
      {
        title: 'Web Security',
        topics: [
          'Web Application Security',
          'OWASP Top 10',
          'Secure Coding Practices',
          'Input Validation',
          'Authentication Security'
        ],
        duration: '1 week',
        completed: false,
        interactive: {
          type: 'ctf',
          reward: 200
        }
      },
      {
        title: 'Cryptography',
        topics: [
          'Basic Cryptography',
          'Encryption Types',
          'Digital Signatures',
          'PKI Infrastructure',
          'Hashing Functions'
        ],
        duration: '1 week',
        completed: false,
        locked: true,
        interactive: {
          type: 'game',
          reward: 250
        }
      }
    ],
    progress: 50
  },
  {
    id: '2',
    title: 'Advanced Penetration Testing',
    description: 'Master the art of ethical hacking and penetration testing with hands-on labs and real-world scenarios.',
    level: 'advanced',
    duration: '8 weeks',
    reward: 2000,
    certification: 'Advanced Penetration Tester',
    instructor: 'Marcus Williams',
    instructorTitle: 'Principal Security Engineer',
    rating: 4.9,
    studentsEnrolled: 8750,
    lastUpdated: '2025-03-01',
    isPremium: true,
    requirements: [
      'Strong understanding of networking protocols',
      'Proficiency in Linux command line',
      'Basic scripting knowledge (Python/Bash)',
      'Completion of Introduction to Cybersecurity course'
    ],
    learningOutcomes: [
      'Master advanced penetration testing techniques',
      'Conduct thorough security assessments',
      'Exploit and document vulnerabilities',
      'Develop custom security tools',
      'Write professional pentest reports'
    ],
    modules: [
      {
        title: 'Advanced Reconnaissance',
        topics: [
          'OSINT Techniques',
          'Network Mapping',
          'Service Enumeration',
          'Vulnerability Assessment',
          'Custom Reconnaissance Tools'
        ],
        duration: '2 weeks',
        completed: false,
        interactive: {
          type: 'lab',
          reward: 300
        }
      },
      {
        title: 'Exploitation Techniques',
        topics: [
          'Exploit Development',
          'Buffer Overflows',
          'Web Application Exploitation',
          'Privilege Escalation',
          'Post-Exploitation'
        ],
        duration: '2 weeks',
        completed: false,
        interactive: {
          type: 'ctf',
          reward: 400
        }
      },
      {
        title: 'Advanced Web Attacks',
        topics: [
          'Advanced XSS Techniques',
          'SQL Injection Mastery',
          'Authentication Bypasses',
          'File Upload Vulnerabilities',
          'API Security Testing'
        ],
        duration: '2 weeks',
        completed: false,
        locked: true,
        interactive: {
          type: 'lab',
          reward: 350
        }
      },
      {
        title: 'Mobile Application Testing',
        topics: [
          'Android App Testing',
          'iOS Security Assessment',
          'Mobile API Testing',
          'Reverse Engineering Apps',
          'Mobile Malware Analysis'
        ],
        duration: '2 weeks',
        completed: false,
        locked: true,
        interactive: {
          type: 'project',
          reward: 450
        }
      }
    ],
    progress: 0
  }
];

export function Courses() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [showCertification, setShowCertification] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'reviews'>('overview');

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('completed_courses, points, level')
          .eq('id', user.id)
          .single();
        setUserProgress(data);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleModuleClick = (course: any, moduleIndex: number) => {
    if (course.isPremium) {
      setShowPremiumModal(true);
      return;
    }
    handleModuleCompletion(course.id, moduleIndex);
  };

  const handleModuleCompletion = async (courseId: string, moduleIndex: number) => {
    try {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      const module = course.modules[moduleIndex];
      const reward = module.interactive.reward;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            points: (userProgress?.points || 0) + reward,
            completed_courses: [...(userProgress?.completed_courses || []), `${courseId}-${moduleIndex}`]
          })
          .eq('id', user.id);

        const allModulesCompleted = course.modules.every((m, idx) => 
          userProgress?.completed_courses?.includes(`${courseId}-${idx}`)
        );

        if (allModulesCompleted) {
          setShowCertification(true);
        }

        await fetchUserProgress();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Learning Path</h1>
          <p className="text-gray-400">Master cybersecurity step by step</p>
          {userProgress && (
            <div className="mt-4 flex justify-center gap-4">
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <div className="text-sm text-gray-400">Total Points</div>
                <div className="text-xl font-bold text-green-500">{userProgress.points || 0}</div>
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <div className="text-sm text-gray-400">Level</div>
                <div className="text-xl font-bold text-blue-500">
                  {userProgress.level?.charAt(0).toUpperCase() + userProgress.level?.slice(1) || 'Beginner'}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`w-full text-left p-6 rounded-lg border transition-colors ${
                  selectedCourse?.id === course.id
                    ? 'bg-gray-800 border-green-500'
                    : 'bg-gray-900 border-gray-800 hover:border-green-500'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{course.title}</h3>
                      {course.isPremium && (
                        <Crown className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-400">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span>{course.rating}</span>
                      <span className="mx-2">•</span>
                      <span>{course.studentsEnrolled.toLocaleString()} students</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.level === 'beginner' ? 'bg-green-900 text-green-200' :
                    course.level === 'intermediate' ? 'bg-yellow-900 text-yellow-200' :
                    'bg-red-900 text-red-200'
                  }`}>
                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{course.duration}</span>
                  <Trophy className="w-4 h-4 ml-4 mr-1 text-yellow-500" />
                  <span>{course.reward} pts</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400">{course.description}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedCourse ? (
              <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
                        {selectedCourse.isPremium && (
                          <span className="bg-yellow-900 text-yellow-200 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <Crown className="w-4 h-4 mr-1" />
                            Premium
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <img
                          src={`https://ui-avatars.com/api/?name=${selectedCourse.instructor.replace(' ', '+')}&background=random`}
                          alt={selectedCourse.instructor}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span>{selectedCourse.instructor}</span>
                        <span className="mx-2">•</span>
                        <span>{selectedCourse.instructorTitle}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="text-yellow-500">{selectedCourse.reward} pts</span>
                    </div>
                  </div>

                  <div className="flex border-b border-gray-800 mb-6">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`px-4 py-2 font-medium ${
                        activeTab === 'overview'
                          ? 'text-green-500 border-b-2 border-green-500'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('content')}
                      className={`px-4 py-2 font-medium ${
                        activeTab === 'content'
                          ? 'text-green-500 border-b-2 border-green-500'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Course Content
                    </button>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`px-4 py-2 font-medium ${
                        activeTab === 'reviews'
                          ? 'text-green-500 border-b-2 border-green-500'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Reviews
                    </button>
                  </div>

                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Course Description</h3>
                        <p className="text-gray-400">{selectedCourse.description}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                        <ul className="space-y-2">
                          {selectedCourse.requirements.map((req, index) => (
                            <li key={index} className="flex items-center text-gray-400">
                              <ChevronRight className="w-4 h-4 mr-2 text-green-500" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">What You'll Learn</h3>
                        <ul className="space-y-2">
                          {selectedCourse.learningOutcomes.map((outcome, index) => (
                            <li key={index} className="flex items-center text-gray-400">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              {outcome}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'content' && (
                    <div className="space-y-8">
                      {selectedCourse.modules.map((module, index) => (
                        <div key={index} className={`relative ${
                          module.locked ? 'opacity-50' : ''
                        }`}>
                          {index !== 0 && (
                            <div className="absolute left-6 -top-4 w-0.5 h-4 bg-gray-700"></div>
                          )}
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700">
                              {module.completed ? (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                              ) : module.locked ? (
                                <Lock className="w-6 h-6 text-gray-500" />
                              ) : (
                                <Play className="w-6 h-6 text-blue-500" />
                              )}
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold">{module.title}</h3>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 text-gray-500 mr-1" />
                                  <span className="text-sm text-gray-400">{module.duration}</span>
                                </div>
                              </div>
                              <ul className="space-y-2 mb-4">
                                {module.topics.map((topic, topicIndex) => (
                                  <li
                                    key={topicIndex}
                                    className="flex items-center text-gray-400"
                                  >
                                    <BookOpen className="w-4 h-4 mr-2 text-gray-500" />
                                    {topic}
                                  </li>
                                ))}
                              </ul>
                              {module.interactive && (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center text-sm">
                                    {module.interactive.type === 'quiz' && <Brain className="w-4 h-4 text-blue-500 mr-1" />}
                                    {module.interactive.type === 'lab' && <Terminal className="w-4 h-4 text-green-500 mr-1" />}
                                    {module.interactive.type === 'ctf' && <Target className="w-4 h-4 text-red-500 mr-1" />}
                                    <span className="text-yellow-500">+{module.interactive.reward} pts</span>
                                  </div>
                                  <button
                                    onClick={() => handleModuleClick(selectedCourse, index)}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                      module.completed
                                        ? 'bg-green-600 text-white'
                                        : module.locked
                                        ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                    disabled={module.locked}
                                  >
                                    {module.completed ? 'Completed' : 'Start Module'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold">{selectedCourse.rating}</div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < Math.floor(selectedCourse.rating)
                                    ? 'text-yellow-500'
                                    : 'text-gray-600'
                                }`}
                                fill={i < Math.floor(selectedCourse.rating) ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {selectedCourse.studentsEnrolled.toLocaleString()} students
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          Last updated: {new Date(selectedCourse.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 flex items-center justify-center h-full">
                <p className="text-gray-400">Select a course to view its content</p>
              </div>
            )}
          </div>
        </div>

        {showPremiumModal && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-8 rounded-lg max-w-md w-full mx-4 relative">
              <button
                onClick={() => setShowPremiumModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center">
                <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Unlock Premium Content</h3>
                <p className="text-gray-400 mb-6">
                  Get access to all premium courses, advanced labs, and exclusive content
                </p>
                
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-4">Premium Benefits:</h4>
                  <ul className="space-y-3 text-left">
                    <li className="flex items-center text-gray-300">
                      <Shield className="w-5 h-5 text-green-500 mr-2" />
                      Access all premium courses
                    </li>
                    <li className="flex items-center text-gray-300">
                      <Terminal className="w-5 h-5 text-green-500 mr-2" />
                      Advanced hands-on labs
                    </li>
                    <li className="flex items-center text-gray-300">
                      <Brain className="w-5 h-5 text-green-500 mr-2" />
                      Expert-led workshops
                    </li>
                    <li className="flex items-center text-gray-300">
                      <Zap className="w-5 h-5 text-green-500 mr-2" />
                      Priority support
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowPremiumModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={() => {
                      // Handle premium subscription
                      setShowPremiumModal(false);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-colors"
                  >
                    Go Premium
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCertification && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-8 rounded-lg max-w-2xl w-full mx-4">
              <div className="text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
                <p className="text-gray-400 mb-4">
                  You've earned the {selectedCourse?.certification} certification!
                </p>
                <button
                  onClick={() => setShowCertification(false)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}