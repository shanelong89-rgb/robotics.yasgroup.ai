# YAS Assurance - Fleet Intelligence Platform

## Overview
YAS is a Next.js 15 web application providing a Fleet Intelligence Platform for fleet operators. It includes features for fleet management, telemetry, risk assessment, claims, capital markets, and more.

## Architecture
- **Framework**: Next.js 15.5 (App Router) with TypeScript
- **React**: React 19
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand
- **Maps**: Leaflet / React-Leaflet
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Auth**: Custom auth with middleware-based route protection via cookies
- **PWA**: @ducanh2912/next-pwa (currently disabled)
- **Backend**: Self-contained — all API routes are Next.js API routes serving demo data. No external backend required.

## Project Structure
```
src/
├── app/           # Next.js App Router pages and API routes
│   ├── api/       # API routes (auth, command, telemetry, agents, etc.)
│   ├── (auth)/    # Auth-related pages (login, signup)
│   └── ...        # Feature pages (fleet, risk, claims, etc.)
├── components/    # Reusable React components
├── context/       # React context providers
├── hooks/         # Custom React hooks
├── lib/           # Utility functions, API client, demo data
│   ├── api.ts     # API client — points to local /api routes
│   ├── socket.ts  # WebSocket client (only connects when NEXT_PUBLIC_WS_URL set)
│   └── demo-data.ts # Comprehensive demo dataset for all features
├── store/         # Zustand stores
├── types/         # TypeScript type definitions
└── middleware.ts  # Next.js middleware for auth (cookie-based)
```

## API Routes
- `POST /api/auth/login` — Demo login (admin@yas.io / demo1234), sets yas_token cookie server-side
- `GET /api/auth/me` — Returns current user from token
- `POST /api/auth/logout` — Clears auth cookie
- `GET /api/command/snapshot` — Returns full fleet snapshot (assets, alerts, KPIs) from demo data
- `POST /api/telemetry/ingest` — Telemetry ingestion endpoint
- `POST /api/agents/chat` — AI chat endpoint (requires OPENAI_API_KEY or ANTHROPIC_API_KEY)

## Demo Credentials
- Email: admin@yas.io
- Password: demo1234

## Environment Variables (all optional)
- `NEXT_PUBLIC_API_URL` — External backend API URL (if set, login proxies to it)
- `NEXT_PUBLIC_WS_URL` — WebSocket URL for live updates (disabled if unset)
- `NEXT_PUBLIC_SITE_URL` — Public site URL for telemetry and Tesla OAuth
- `TELEMETRY_INGEST_SECRET` — Secret for telemetry ingestion API (required in production)
- `TESLA_CLIENT_ID` / `TESLA_CLIENT_SECRET` / `TESLA_REDIRECT_URI` — Tesla API credentials
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` — AI agent chat API keys

## Running
- **Dev**: `npm run dev` (port 5000, bound to 0.0.0.0)
- **Build**: `npm run build`
- **Start**: `npm run start` (port 5000, bound to 0.0.0.0)
- **Package Manager**: npm with `--legacy-peer-deps` flag (for @ducanh2912/next-pwa peer deps)
- **Deployment**: Configured for autoscale deployment via Replit

## Migration History
- Migrated from Vercel to Replit (self-contained, no external backend)
- Upgraded from React 18 + Next.js 14 → React 19 + Next.js 15
- Removed unused packages: @privy-io/react-auth, @farcaster/mini-app-solana
