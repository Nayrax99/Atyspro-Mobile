# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Reference document

**Read `SKILL.md` at the start of every session.** It contains the complete project context: product vision, business rules, Supabase schema, code conventions, and next steps. Never start working on AtysPro without reading it first.

## Repository Structure

This is a monorepo with two subprojects:

- **`atyspro-backend/`** — Next.js 16 (App Router) application serving REST API, web dashboard, and Twilio webhooks
- **`atyspro-mobile/`** — Expo 54 / React Native app (Expo Router)

## Commands

### Backend (`atyspro-backend/`)

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm run lint     # ESLint
```

### Mobile (`atyspro-mobile/`)

```bash
npm start        # Start Expo dev server
npm run android  # Run on Android
npm run ios      # Run on iOS
npm run lint     # ESLint
```

## Backend Architecture

### Layer structure

```
src/app/api/         # Next.js route handlers (thin — delegate to modules)
src/modules/         # Domain services: leads, twilio, dev, health
  <domain>/
    index.ts         # Route handler logic
    <domain>.service.ts  # Business logic (pure functions + DB calls)
    <domain>.types.ts    # TypeScript types for this domain
src/lib/             # Shared utilities
  supabase.ts        # Supabase client factory
  auth.ts            # JWT extraction + requireAuth()
  leadParsing.ts     # SMS parsing (pure functions)
  leadScoring.ts     # Priority score calculation (pure functions)
  twilioClient.ts    # Twilio SDK wrapper
  smsTemplates.ts    # SMS template strings
src/db/migrations/   # SQL migration files (run in Supabase SQL Editor)
src/types/           # Shared TypeScript types (Lead, global)
```

### Supabase client pattern

Three clients exist in `src/lib/supabase.ts`:
- `supabase` — anon key, subject to RLS (legacy/compat)
- `supabaseAdmin` — service_role key, bypasses RLS; used by Twilio webhooks and dev tools
- `createSupabaseClient(token)` — anon key + user JWT header; used by authenticated API endpoints for RLS enforcement

### Auth flow

- Magic link email via Supabase Auth
- `getAuthUser(req)` / `requireAuth(req)` in `src/lib/auth.ts` extract the JWT from `Authorization: Bearer <token>` header or `sb-access-token` cookie
- The JWT is then passed to `createSupabaseClient(token)` so queries run under the authenticated user's RLS context
- `account_id` is resolved from the `accounts` table using `user_id = auth.uid()`

### Lead qualification flow (Twilio webhooks)

1. Incoming call → `POST /api/webhooks/twilio/voice` → plays TwiML voice message → creates minimal lead + sends qualification SMS
2. Client responds via SMS → `POST /api/webhooks/twilio/sms` → `parseSms()` extracts `type_code`, `delay_code`, address, name → `computeScore()` calculates `priority_score` and `value_estimate` → upsert lead
3. If SMS is unexploitable: sends `RELANCE_CORRECTION_SMS` (max 2 relances); after 2, marks lead `needs_review`

### Lead scoring

`type_code` (1=dépannage, 2=installation, 3=devis, 4=autre) + `delay_code` (1=today, 2=48h, 3=week, 4=flexible) → `priority_score` (0-100) + `value_estimate` (low/medium/high/null)

### DB tables (all RLS-enabled)

`accounts`, `phone_numbers`, `leads`, `calls`, `sms_messages` — all scoped by `account_id`.

### Dev endpoints

- `POST /api/dev/seed` — seeds test account + leads
- `POST /api/dev/simulate/sms` — simulates an inbound SMS without Twilio

## Mobile Architecture

### Layer structure

```
app/              # Expo Router file-based routes (thin wrappers only)
src/
  screens/        # Screen components (Auth, Leads, Dialer, Settings)
  contexts/       # AuthContext, BusinessContext (React context + providers)
  services/       # API layer: api.ts (fetch wrapper), auth.service.ts, leads.service.ts
  navigation/     # RootNavigator (auth guard + stack), MainTabNavigator (tabs)
  components/     # Shared UI components (leads, dialer, layout, common)
  constants/      # colors.ts, theme.ts
  utils/          # format.ts
```

### Key patterns

- `app/_layout.tsx` delegates entirely to `src/navigation/RootNavigator`; route files in `app/` are thin wrappers importing from `src/screens/`
- Auth is managed by `AuthContext` (`src/contexts/AuthContext.tsx`): token stored via `expo-secure-store`, validated on startup via `GET /api/auth/me`
- Backend URL configured via `EXPO_PUBLIC_BACKEND_URL` env var; defaults to `https://atyspro-backend.vercel.app`
- Navigation guard in `RootNavigator`: unauthenticated → redirect to `/login`; authenticated on auth route → redirect to `/(tabs)`

## Environment Variables

### Backend (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

### Mobile (`.env`)

```
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000   # for local dev
```
