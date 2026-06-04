# calClories

calClories is a nutrition tracking app focused on daily consistency over complexity. It helps users set a personalized calorie and macro target, log meals quickly, and track weight trends to support fat loss, maintenance, or gain goals.

## Purpose

The purpose of this project is to provide a lightweight, fast, mobile-first food logging experience that reduces friction compared to traditional calorie trackers.

## Goals

- Make logging meals fast enough to use every day.
- Generate a practical calorie and macro target from onboarding data.
- Track progress with daily totals, trends, and simple visual feedback.
- Keep data local-first and privacy-friendly for early iterations.
- Create a strong product foundation for future integrations and coaching features.

## MVP Note

This project is currently an MVP (Minimum Viable Product).

Current MVP scope includes:

- Onboarding flow for profile, activity, goal, and macro preset setup.
- Daily meal logging with search and quick add.
- Calorie and macro progress summary for the current day.
- Weight logging and trend visualization.
- Basic adaptive target estimation logic.
- Local persistence using IndexedDB.

## Tech Stack

- React
- TypeScript
- Vite
- TanStack Query
- Dexie (IndexedDB)
- Tailwind CSS
- Recharts

## Run Locally

1. Install dependencies:

   npm install

2. Start the development server:

   npm run dev

3. Open the app in your browser:

   http://localhost:5173

## Scripts

- npm run dev: start local dev server
- npm run build: create production build
- npm run preview: preview production build locally
- npm run lint: run lint checks
