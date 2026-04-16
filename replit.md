# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (local) + Supabase (external)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo (React Native) — Allway Taxi Driver App

## Allway Taxi Driver App

A production-grade native mobile application for taxi drivers. Connects to an existing live Supabase backend (PostgreSQL + Realtime).

### Features
- Driver authentication via phone + PIN against `drivers` table
- Go on/off shift with GPS tracking, wake lock, and heartbeat
- Receive broadcast pool trips (pending, unassigned)
- Receive direct dispatch trips (full-screen modal with 120s countdown)
- Active trip management (call customer, open maps, complete trip)
- Trip history with filters (all/awaiting/completed/cancelled)
- Weekly earnings chart
- Account profile with earnings breakdown and PIN change
- Supabase Realtime for live trip updates (3 channels)
- Admin remote toggle support (force online/offline)
- 15-second polling backup for unreliable mobile networks

### External Services
- **Supabase**: Database and Realtime (env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`)

### Design System: "Beirut Midnight"
- Dark background: `#0D0D14` / `#030303`
- Primary/Accent: `#F5B800` (Allway Yellow)
- Success: `#5DCAA5`
- Error: `#F09595`
- Warning: `#EF9F27`
- Typography: Inter (400, 500, 600, 700)
- UI direction: premium dark glass, compact driver-first controls, yellow operational accents

### Recent UI and Stability Notes
- Root route renders the login screen directly when no driver session exists, avoiding blank redirect states.
- Icon imports use `@expo/vector-icons`; avoid `@expo-vector-icons` and avoid adding unneeded icon packages.
- Shared header is used on authenticated dashboard/history/account tabs.
- Login screen uses a compact centered secure-gateway card with the Allway yellow mark and direct sign-in action placement.

### Database Tables (Supabase - read from external)
- `drivers` — Driver profiles, location, shift status
- `trips` — Trip records with pickup/dropoff, status, fare
- `customers` — Customer info (read-only for driver app)

## Key Commands

- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app
