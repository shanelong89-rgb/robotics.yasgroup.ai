# YAS Assurance - Fleet Intelligence Platform

## Overview
YAS is a Next.js 14 web application providing a Fleet Intelligence Platform for fleet operators. It includes features for fleet management, telemetry, risk assessment, claims, capital markets, and more.

## Architecture
- **Framework**: Next.js 14.2.35 (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand
- **Maps**: Leaflet / React-Leaflet
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Auth**: Custom auth with middleware-based route protection
- **PWA**: @ducanh2912/next-pwa (currently disabled)

## Project Structure
```
src/
├── app/           # Next.js App Router pages and API routes
│   ├── api/       # API routes (auth, telemetry, agents)
│   ├── (auth)/    # Auth-related pages (login)
│   └── ...        # Feature pages (fleet, risk, claims, etc.)
├── components/    # Reusable React components
├── context/       # React context providers
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and API clients
├── store/         # Zustand stores
├── types/         # TypeScript type definitions
└── middleware.ts  # Next.js middleware for auth
```

## Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API URL (defaults to http://localhost:4000/api/v1)
- `NEXT_PUBLIC_WS_URL` - WebSocket URL (defaults to http://localhost:4000)
- `NEXT_PUBLIC_SITE_URL` - Site URL for telemetry
- `TELEMETRY_INGEST_SECRET` - Secret for telemetry ingestion API
- `TESLA_CLIENT_ID` / `TESLA_CLIENT_SECRET` - Tesla API credentials
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` - AI agent chat API keys

## Running
- **Dev**: `npm run dev` (port 5000, bound to 0.0.0.0)
- **Build**: `npm run build`
- **Start**: `npm run start` (port 5000, bound to 0.0.0.0)
- **Package Manager**: npm with `--legacy-peer-deps` flag needed due to peer dependency conflicts
