# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DineScore is a modern web application for rating restaurant dining experiences, particularly focused on pizza restaurants. Users can create sessions for restaurant visits, invite guests, and collectively rate various aspects of the dining experience such as location, service, menu, bill, pizza dough, and ingredients.

## Technology Stack

- **Frontend Framework**: Next.js 15 (App Router)
- **UI Components**: HeroUI component library (version 2.x)
- **Styling**: Tailwind CSS with tailwind-variants
- **State Management**: React Hooks and Context API
- **Animations**: Framer Motion, Lottie animations
- **Backend & Auth**: Firebase (Firestore, Authentication)
- **Maps Integration**: Google Maps API (Place Autocomplete)
- **Language**: TypeScript
- **Package Manager**: Bun (recommended) or npm/yarn

## Development Commands

```bash
# Install dependencies (preferred with Bun)
bun install
# Alternative: npm install

# Development server with Turbopack
bun dev
# or: npm run dev

# Production build
bun run build
# or: npm run build

# Start production server
bun run start
# or: npm run start

# Run linting
bun run lint
# or: npm run lint
```

## Key Data Models

- **Session**: Represents a dining experience with date, place, and participants.
  ```typescript
  interface Session {
    id?: string;
    date: string;
    name: string;
    placeId?: string;
    numberOfGuests: number;
    guests: Guest[];
    status: "open" | "closed";
    results?: {
      location: number;
      service: number;
      menu: number;
      bill: number;
      pizzaDough: number;
      ingredients: number;
    };
  }
  ```

- **Guest**: A participant in a session with their ratings and meal choice.
  ```typescript
  interface Guest {
    name: string;
    note: string;
    meal: string;
    votes: GuestVote;
    photoURL?: string;
    uid?: string;
  }
  ```

- **GuestVote**: Individual ratings for dining criteria.
  ```typescript
  interface GuestVote {
    location: number;
    service: number;
    menu: number;
    bill: number;
    pizzaDough: number;
    ingredients: number;
  }
  ```

## Application Architecture

- **Authentication**: Firebase authentication with Google sign-in
- **Data Storage**: Firebase Firestore for sessions and user data
- **Pages**:
  - Home page with welcome and session creation
  - Session pages for adding guests and collecting votes
  - Results page for viewing aggregated ratings
  - History page for viewing past sessions

## Firebase Integration

The app uses Firebase for authentication and data storage:
- Firebase Authentication for user login (Google)
- Firestore for storing session and voting data
- Actions defined in `actions/firebaseFunctions.ts` handle server-side Firebase operations

## Environment Setup

The application requires Firebase configuration. Create a `.env.local` file based on the `env-example` file with your Firebase credentials before starting the development server.