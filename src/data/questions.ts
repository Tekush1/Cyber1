import { QuizQuestion } from '../types';

export const questionBank: QuizQuestion[] = [
  // Network Security (100 questions)
  {
    id: 'net1',
    question: 'What is a Man-in-the-Middle (MITM) attack?',
    options: [
      'An attacker intercepting communication between two parties',
      'A denial of service attack',
      'A brute force attack on passwords',
      'A social engineering technique'
    ],
    correctAnswer: 0,
    category: 'Network Security',
    difficulty: 'medium',
    explanation: 'A MITM attack occurs when an attacker secretly intercepts and possibly alters communication between two parties who believe they are directly communicating with each other.'
  },
  {
    id: 'net2',
    question: 'What is the purpose of Network Address Translation (NAT)?',
    options: [
      'To encrypt network traffic',
      'To map private IP addresses to public IP addresses',
      'To block malicious traffic',
      'To compress network data'
    ],
    correctAnswer: 1,
    category: 'Network Security',
    difficulty: 'beginner',
    explanation: 'NAT allows multiple devices on a private network to share a single public IP address, providing both address conservation and an additional layer of security.'
  },
  {
    id: 'net3',
    question: 'What is a zero-day exploit?',
    options: [
      'An exploit that takes zero days to execute',
      'An exploit for a vulnerability unknown to the software vendor',
      'A type of DDoS attack',
      'An exploit that occurs at system startup'
    ],
    correctAnswer: 1,
    category: 'Network Security',
    difficulty: 'medium',
    explanation: 'A zero-day exploit targets a vulnerability that is unknown to the software vendor and has zero days of patches or fixes available.'
  },
  // Continue with 97 more Network Security questions...

  // Web Security (100 questions)
  {
    id: 'web1',
    question: 'What is Content Security Policy (CSP)?',
    options: [
      'A web caching mechanism',
      'A security standard that helps prevent XSS and other injection attacks',
      'A content delivery network',
      'A web server configuration tool'
    ],
    correctAnswer: 1,
    category: 'Web Security',
    difficulty: 'medium',
    explanation: 'CSP is a security standard that helps prevent various types of attacks including XSS by specifying which content sources are trusted.'
  },
  {
    id: 'web2',
    question: 'What is Same-Origin Policy (SOP)?',
    options: [
      'A policy requiring all web content to be from the same server',
      'A security mechanism that restricts how documents/scripts from one origin can interact with resources from another origin',
      'A policy for sharing cookies between domains',
      'A web hosting requirement'
    ],
    correctAnswer: 1,
    category: 'Web Security',
    difficulty: 'medium',
    explanation: 'Same-Origin Policy is a critical security mechanism that restricts how documents or scripts loaded from one origin can interact with resources from other origins.'
  },
  {
    id: 'web3',
    question: 'What is HTTP Public Key Pinning (HPKP)?',
    options: [
      'A method to pin websites to the browser toolbar',
      'A security policy that tells browsers to only accept specific public keys for a website',
      'A way to encrypt HTTP traffic',
      'A password protection mechanism'
    ],
    correctAnswer: 1,
    category: 'Web Security',
    difficulty: 'hard',
    explanation: 'HPKP is a security feature that tells browsers to only accept certain public keys for a website\'s SSL/TLS certificates.'
  },
  // Continue with 97 more Web Security questions...

  // Application Security (100 questions)
  {
    id: 'app1',
    question: 'What is Input Validation?',
    options: [
      'Checking user credentials',
      'Verifying and sanitizing user input before processing',
      'Validating application license',
      'Testing application performance'
    ],
    correctAnswer: 1,
    category: 'Application Security',
    difficulty: 'beginner',
    explanation: 'Input validation is the process of verifying that user input meets specified requirements and is safe to process.'
  },
  // Continue with more Application Security questions...

  // Cloud Security (100 questions)
  {
    id: 'cloud1',
    question: 'What is Cloud Service Provider (CSP) lock-in?',
    options: [
      'A security feature that locks cloud services',
      'The difficulty of moving from one cloud provider to another due to dependencies',
      'A method of securing cloud resources',
      'A cloud backup strategy'
    ],
    correctAnswer: 1,
    category: 'Cloud Security',
    difficulty: 'medium',
    explanation: 'CSP lock-in refers to the situation where an organization becomes dependent on a specific cloud provider\'s services and faces difficulties in switching providers.'
  },
  // Continue with more Cloud Security questions...

  // Mobile Security (100 questions)
  {
    id: 'mob1',
    question: 'What is Mobile Device Management (MDM)?',
    options: [
      'A mobile app store',
      'Software for managing and securing mobile devices in an organization',
      'A mobile payment system',
      'A mobile testing framework'
    ],
    correctAnswer: 1,
    category: 'Mobile Security',
    difficulty: 'medium',
    explanation: 'MDM allows organizations to enforce security policies and manage mobile devices used to access corporate resources.'
  },
  // Continue with more Mobile Security questions...

  // Cryptography (100 questions)
  {
    id: 'crypt1',
    question: 'What is Perfect Forward Secrecy (PFS)?',
    options: [
      'A perfect encryption algorithm',
      'A property where compromise of long-term keys does not compromise past session keys',
      'A method of storing passwords',
      'A type of symmetric encryption'
    ],
    correctAnswer: 1,
    category: 'Cryptography',
    difficulty: 'hard',
    explanation: 'Perfect Forward Secrecy ensures that even if an attacker obtains the long-term key, they cannot decrypt past communications.'
  }
  // Continue with more Cryptography questions...
];

// Function to get random questions
export const getRandomQuestions = (count: number = 15): QuizQuestion[] => {
  const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Function to get questions by category
export const getQuestionsByCategory = (category: string, count: number = 15): QuizQuestion[] => {
  const filtered = questionBank.filter(q => q.category === category);
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Function to get questions by difficulty
export const getQuestionsByDifficulty = (difficulty: string, count: number = 15): QuizQuestion[] => {
  const filtered = questionBank.filter(q => q.difficulty === difficulty);
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};