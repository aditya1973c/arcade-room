# 🕹️ Arcade Room Gaming

> **Arcade Room** is a modern, premium gaming discovery and collection tracking platform designed to help gamers discover, rate, and track their favorite titles based on the actual *experience and vibe* of playing them.

---

## 🌟 Key Features

- 🔍 **Real-Time Game Discovery & IGDB Search**: Search millions of games dynamically integrated with the **IGDB (Twitch API)** and cached seamlessly in Firebase Firestore.
- 🎨 **Interactive Vibe Chart**: Visual breakdown analyzing a game's key pillars: **Gameplay, Graphics, Story, Audio, and Replayability** with smooth hover animations.
- ⏱️ **Arcade Room Meter**: Intuitive verdict gauge categorizing recommendations into clear community ratings: **Skip**, **Timepass**, **Go for it**, and **Perfection**.
- 👤 **User Profiles & Authentication**: Complete Firebase Auth integration (Email/Password & OTP) with real-time profile editing, custom avatars, social links, and account management.
- 📚 **Personal Library & Watchlists**: One-click tracking to mark games as **Interested** or **In Collection** with live synced top-trending leaderboards.
- 💬 **Reviews & Discussion Threads**: Rich review ecosystem with rating pills, threaded replies, edit/delete controls, and user notification triggers.
- 🛡️ **Admin Dashboard**: Dedicated portal for administrators to create, edit, and curate featured games.
- ✨ **Glassmorphic Dark UI**: High-performance responsive interface featuring frosted glass backdrop blurs, glow accents, smooth page transitions, and a custom 404 page.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Library**: [React 19](https://react.dev/)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore Realtime Database & Authentication)
- **External API**: [IGDB API](https://api-docs.igdb.com/) (via Twitch API Integration)
- **Styling**: CSS Modules, Tailwind CSS, Glassmorphic UI

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) and `npm` installed.

### 2. Installation

Clone the repository and install the project dependencies:

```bash
git clone https://github.com/aditya1973c/arcade-room.git
cd arcade-room
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory and add your IGDB / Twitch credentials:

```env
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
```

*(Firebase credentials are configured in `src/lib/firebase.js`)*

### 4. Running the Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📦 Scripts

- `npm run dev` – Starts the development server with hot-reloading.
- `npm run build` – Builds the production-ready bundle using Next.js Turbopack.
- `npm run start` – Starts the production server.
- `npm run lint` – Runs ESLint code quality checks.

---

## 📁 Project Structure

```text
arcade-room/
├── public/                 # Static assets and icons
├── src/
│   ├── app/                # Next.js App Router pages & API routes
│   │   ├── accounts/edit/  # Account settings & profile editing
│   │   ├── admin/create/   # Admin game creation portal
│   │   ├── api/            # API endpoints (IGDB search, seed)
│   │   ├── collections/    # User collection page
│   │   ├── game/[id]/      # Game detail page (Vibe Chart, Reviews)
│   │   ├── forgot-password/# Password reset page
│   │   ├── login/          # User login page
│   │   ├── profile/        # Public profile page
│   │   ├── signup/         # Account registration page
│   │   ├── watchlist/      # User watchlist page
│   │   └── not-found.js    # Custom 404 page
│   ├── components/         # Reusable UI components (Navbar, AuthGuard, Footer)
│   ├── context/            # Global React state (GameContext, ProfileContext)
│   └── lib/                # Firebase configuration & initialization
├── README.md
└── package.json
```

---

## 📄 License

Developed by **Resengal Studio** © 2026. All rights reserved.
