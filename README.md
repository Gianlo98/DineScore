DineScore 🍽️🎉
=========

DineScore is a modern web application template built on top of Next.js 14 (App Router), NextUI v2, and Tailwind CSS. It’s designed to provide a streamlined starting point for developers looking to create interactive, performant, and beautiful applications. This project integrates Firebase for authentication and data management, leverages Bun as a fast all-in-one JavaScript runtime, and supports Node.js 23+ features out of the box. 🍕🚀


Idea Behind the Project 🍀
-----------------------

The idea behind DineScore is to help developers quickly spin up a dining or scoring-related application with minimal configuration. Whether you’re building a restaurant rating tool, a personal recipe tracker, or any application where you need to authenticate users and store data securely, DineScore offers a solid foundation. It focuses on:

- Modern UI/UX with NextUI and Tailwind
- Performance & Speed via Next.js 14’s App Router and Bun
- Developer Experience with TypeScript, Framer Motion, theming, and Firebase integration

Technologies Used
-----------------

- Next.js 14 (App Router): Improved performance and routing
- NextUI v2: Minimalistic React-based UI library
- Tailwind CSS & Tailwind Variants: Utility-first styling with flexibility
- TypeScript: Typed JavaScript for better code reliability
- Framer Motion: Smooth animations
- next-themes: Easy theming (light/dark modes)
- Firebase: Authentication, storage, and real-time data
- Bun: Fast JS runtime, bundler, and package manager

Requirements
------------

- Node.js 23+ (for modern features and compatibility)
- Bun (optional, but recommended for faster development)

Project Structure
-----------------
```
.
├─ app/
│  ├─ (components)/          # Reusable UI components & utilities
│  ├─ (routes)/              # Additional routes (parallel or nested)
│  ├─ layout.tsx             # Root layout for the App Router
│  ├─ page.tsx               # Main entry page
│  ├─ middleware.ts          # Middleware for auth and route protection
│  └─ …                    # Additional pages and segments
│
├─ context/
│  └─ authContext.tsx        # React context for managing auth state (client-side)
│
├─ firebase/
│  ├─ firebaseConfig.ts      # Firebase client-side initialization
│  └─ …                    # Additional Firebase setup
│
├─ lib/
│  └─ utilities.ts           # Helper functions and utilities
│
├─ public/
│  └─ …                    # Static assets
│
├─ styles/
│  └─ globals.css            # Global styles and Tailwind imports
│
└─ … other config files
```

Getting Started
---------------

1. Clone the Repository:
```
git clone https://github.com/your-username/dine-score.git
cd dine-score
```
2. Install Dependencies (using Bun):
```
bun install
```
(You can also use npm, yarn, or pnpm if you prefer.)

3. Configure Firebase:In your `.env.local` file, add your Firebase config (see `env-example`)
4. Run the Development Server:
```
bun dev
```
Open http://localhost:3000 in your browser.
5. Production Build:
```
bun run build
bun run start
```

License
-------

This project is licensed under the [MIT License](https://github.com/nextui-org/next-app-template/blob/main/LICENSE).