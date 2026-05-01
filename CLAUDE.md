# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

Internal admin dashboard ("Insights Hub") for managing the Foreware platform — blog posts, forms/popups, tracking codes, leads, users. Talks to the same Express backend (`../foreware-api`) as the public site (`../foreware`). The project was scaffolded from Lovable.dev (`lovable-tagger` is a dev-only Vite plugin); a `supabase/` folder also exists from earlier prototyping but the runtime auth/data path is the custom `foreware-api`, not Supabase.

## Commands

```bash
npm run dev          # vite (default :8080, host "::")
npm run build        # production build
npm run build:dev    # build with mode=development (keeps dev plugins)
npm run preview      # preview built bundle
npm run lint         # eslint .
npm run test         # vitest run (one-shot)
npm run test:watch   # vitest in watch mode
```

Run a single test: `npx vitest run src/path/to/file.test.tsx` (jsdom env, setup at `src/test/setup.ts` mocks `window.matchMedia`).

## Required env vars

- `VITE_FOREWARE_API_URL` — base URL of the Express API. Read in `src/lib/apiClient.ts`. Must include the `/api` segment if the backend expects it (the resource paths here are bare, e.g. `auth`, `posts`).

## Architecture

**Stack:** Vite 5, React 18, TypeScript, Tailwind v3, shadcn-ui (Radix primitives in `src/components/ui/`), TanStack Query, react-router-dom v6, axios with `withCredentials`, React Hook Form + Zod 3, TipTap (rich text), Recharts, Sonner.

**Path alias:** `@/*` → `./src/*` (configured in both `vite.config.ts` and `tsconfig.json`). shadcn aliases live in `components.json` (`@/components/ui`, `@/lib/utils`, `@/hooks`).

**Auth-gated SPA:** `src/App.tsx` wraps everything in `AuthProvider`. `AppRoutes` reads `currentUser` from `useAuth()`; if null, render `AuthPage`, otherwise render `DashboardLayout` with the protected `Routes`. There is no per-route guard — the entire app is behind the auth gate.

`AuthContext` (`src/contexts/AuthContext.tsx`) calls `GET /auth/me` on mount to hydrate the session from the httpOnly cookie set by the API. `login` POSTs to `/auth/login`, then re-runs `refreshUser`. `logout` POSTs `/auth/logout`. Roles are typed `"super_admin" | "admin" | "user"` (lowercase here; the API stores them as `SUPER_ADMIN | ADMIN | USER`).

**API client** (`src/lib/apiClient.ts`):
- `axios.create({ withCredentials: true })` — cookies are the primary auth transport. A request interceptor *also* attaches `Authorization: Bearer <localStorage.accessToken>` if present (legacy / fallback path).
- A response interceptor catches `401`, calls `POST /auth/refresh-token` (which the API will rotate via cookies), and replays the original request once. On refresh failure it calls `/auth/logout`. The `isRefreshing` flag is module-scoped — concurrent 401s won't all retry.
- `createResourceApi<T>(resource)` returns `{ getAll, getOne, create, update, delete }` and is the canonical way to talk to a resource. `create` and `update` accept `{ path }` to suffix the URL (used for non-CRUD endpoints like `auth/login`, `auth/logout`).

**Feature hooks layout** (`src/hooks/<feature>/`): each feature ships `<name>Service.ts` (Zod schema + `createResourceApi` instance + types), `<name>Queries.ts` (TanStack `queryOptions`), and per-mutation files (`useCreate*`, `useUpdate*`, `useDelete*`). Existing features: `auth`, `post`, `form`, `lead`, `tracking`, `emailto`, `activity-logs`. Mirror this layout when adding a new one.

**Pages** (`src/pages/`): each top-level dashboard route has either a single file (`AuthPage.tsx`, `PagesManager.tsx`, `ProfilePage.tsx`, `UsersPage.tsx`, `NotFound.tsx`) or a folder grouping the page with its sub-components (`blog/`, `form/`, `home/`, `lead/`, `settings/`, `tracking/`). Routes are declared inline in `src/App.tsx`.

**Layout & nav:** `DashboardLayout` (`src/components/DashboardLayout.tsx`) holds the collapsible sidebar, top bar, and user dropdown. The "Users" sidebar entry only renders for `currentUser.role === "super_admin"`. New top-level routes need both a `<Route>` in `App.tsx` and an entry in the `navItems` array (or in the header's title fallback map).

**shadcn-ui:** All primitives are vendored under `src/components/ui/`. Add new ones with `npx shadcn@latest add <component>` — `components.json` is already configured (style: `default`, base color: `slate`, css vars on).

## Conventions worth respecting

- Use the resource factory + per-feature hook directory; don't call `apiClient.get/post` directly from components.
- Zod here is **v3** (`zod@^3.25`) — the public site (`../foreware`) uses Zod 4. Schemas don't transfer cleanly between them.
- Toast feedback: use `sonner` (`import { toast } from "sonner"`); the legacy `useToast` hook from `src/hooks/use-toast.ts` is wired but newer code prefers Sonner (matches `App.tsx` ordering).
- Don't store auth tokens in `localStorage` going forward — cookies are the source of truth. The `localStorage.accessToken` interceptor branch is a legacy fallback.
- `vite.config.ts` keeps `componentTagger()` only when `mode === "development"` (Lovable inspector) — don't enable it in production builds.
