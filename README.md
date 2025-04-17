# Vite React TypeScript Starter

## Overview

This project is a starter template for building web applications using Vite, React, and TypeScript. It includes several pre-configured features to help you get started quickly, including:

-   Authentication
-   Database integration
-   UI components
-   Game challenges

## Features

-   *Modern Tooling:* Built with Vite for fast development and optimized production builds.
-   *TypeScript:* Uses TypeScript for type safety and improved code maintainability.
-   *React:* Leverages React for building interactive user interfaces.
-   *Routing:* Implements React Router for navigation.
-   *State Management:* (Consider adding Redux or Zustand if your app requires complex state management)
-   *UI Components:* Includes pre-built UI components using Tailwind CSS and Lucide React icons.
-   *Authentication:* Implements user authentication using Supabase.
-   *Database Integration:* Integrates with Supabase for data storage and retrieval.
-   *Game Challenges:* Offers a variety of interactive game challenges to test cybersecurity knowledge.
-   *Theming:* Supports light and dark themes.
-   *Responsive Design:* Designed to work on various screen sizes.

## Technologies Used

-   [Vite](https://vitejs.dev/): A fast build tool and development server.
-   [React](https://reactjs.org/): A JavaScript library for building user interfaces.
-   [TypeScript](https://www.typescriptlang.org/): A typed superset of JavaScript.
-   [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework.
-   [Lucide React](https://lucide.dev/): A library of beautiful icons.
-   [React Router](https://reactrouter.com/): A standard library for routing in React.
-   [Supabase](https://supabase.com/): An open-source Firebase alternative for authentication and database.
-   [Howler.js](https://howlerjs.com/): A Javascript audio library for sound effects.
-   [React Markdown](https://github.com/remarkjs/react-markdown): Markdown component for React.
-   [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter): Syntax highlighting for code snippets.
-   [xterm.js](https://xtermjs.org/): A terminal component written in JavaScript.

## Getting Started

### Prerequisites

-   Node.js (version 18 or higher)
-   npm or yarn
-   A Supabase account and project

### Installation

1.  Clone the repository:

    bash
    git clone <repository-url>
    cd <project-directory>
    

2.  Install dependencies:

    bash
    npm install
    # or
    yarn install
    

3.  Set up environment variables:

    -   Create a .env file in the root directory.
    -   Add your Supabase URL and anonymous key:

        
        VITE_SUPABASE_URL=<your-supabase-url>
        VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
        

4.  Run the development server:

    bash
    npm run dev
    # or
    yarn dev
    

    This will start the development server at http://localhost:5173.

## Project Structure

## Key Components and Features

### Authentication (src/contexts/AuthContext.tsx)

-   Uses Supabase for user authentication.
-   Provides signIn, signUp, and signOut functions.
-   Manages user session and profile data.
-   Automatically creates user profiles in the profiles table upon signup.

### Database (src/lib/supabaseClient.ts)

-   Initializes the Supabase client.
-   Includes helper functions for:
    -   Ensuring user profiles exist.
    -   Updating game progress.
    -   Updating quiz progress.
    -   Fetching user statistics.

### UI Components (src/components/)

-   *Header:* Navigation header with theme toggle and user authentication status.
-   *ThemeToggle:* Component for toggling between light and dark themes.
-   *Game Components:* Reusable components for various game challenges (e.g., MemoryGame, CommandGame).

### Pages (src/pages/)

-   *Auth:* Authentication page for signing in and signing up.
-   *Courses:* Displays a list of available courses.
-   *Leaderboard:* Shows the global leaderboard.
-   *QuickGame:* Allows users to select and play different games.
-   *QuickTest:* Enables users to take quick knowledge tests.
-   *Profile:* Displays user profile information and statistics.
-   *Settings:* Allows users to manage their profile settings, notifications, and privacy.

### Game Challenges

The project includes a variety of interactive game challenges:

-   *Memory Game:* Match security tools and concepts.
-   *Command Master:* Learn essential security commands.
-   *Speed Hacker:* Type commands at lightning speed.
-   *Cryptography:* Break ciphers and decode encrypted messages.
-   *Web Security:* Exploit web vulnerabilities and secure applications.
-   *Reverse Engineering:* Analyze and understand compiled programs.
-   *Binary Exploitation:* Exploit buffer overflows and memory corruption.
-   *Digital Forensics:* Investigate digital evidence and recover data.
-   *OSINT:* Gather intelligence from open sources.
-   *Hardware Security:* Hack embedded systems and IoT devices.
-   *Miscellaneous:* Solve various unique security puzzles.
    -   *Log Analysis:* Analyze system logs to detect intrusions

## Database Schema

The project uses a Supabase database with the following tables:

-   profiles: Stores user profile information.
-   user_progress: Tracks user progress in games and courses.
-   user_activity: Records user activities and achievements.
-   quiz_history: Stores quiz history and results.
-   game_history: Stores game session history and results.

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive messages.
4.  Push your changes to your fork.
5.  Submit a pull request.

## License

This project is licensed under the MIT License.

## Contact

[kushagra dwivedi] - [kushdwivedikd@gmail.com]

## Acknowledgements

-   This project was inspired by...
-   Special thanks to..
