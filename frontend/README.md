# Ocean frontend

The web app users log into to provision and manage their databases. A React 19
SPA (Vite + Tailwind 4) that talks to the Play backend over `/v1`.

## Stack

React 19 · Vite 6 · Tailwind 4 · TanStack Query v5 · React Router 7 ·
React Hook Form + Zod · axios + jose. Tests: Vitest + Cypress.

## Layout

Everything lives under `src/`:

| Path          | What it is                                                         |
| ------------- | ------------------------------------------------------------------ |
| `app/`        | composition root: providers, router, routes, shell, and navigation |
| `features/`   | domain modules: auth, databases, overview, reporting, and users    |
| `components/` | shared presentation: shadcn primitives and small reusable modules  |
| `api/`        | shared axios client plus session, token, and user transport        |
| `lib/`        | framework-independent configuration and utilities                  |
| `types/`      | genuinely shared user contracts                                    |

Tests are **colocated** (`foo.ts` + `foo.test.ts`); Cypress specs live in
`cypress/` (component) and `cypress/e2e/`.

## The model

- **Routing and composition** live in `app/`. `app/router.tsx` mounts the
  protected `app/layout/AppLayout.tsx` once and renders route modules through
  its outlet. Cross-feature composition belongs in `app/routes/`.
- **Auth/session** is owned by `features/auth/AuthProvider.tsx`. It restores sessions,
  logs in/out, stores tokens, sets the bearer token, and clears TanStack Query
  cache on session end.
- **Server state** is TanStack Query. Feature hooks call feature-specific or
  shared clients, which use the shared axios instance.
- **Token refresh** is handled by `api/client.ts`: a `401` triggers one refresh
  attempt, retries the original request, and expires the session if refresh
  fails.
- **Dependency direction** is shared modules → features → app. ESLint prevents
  shared modules from importing features/app and features from importing app.
- **Feature folders stay proportional.** Subfolders are added only when file
  density earns them; small features remain flat. Feature barrels are avoided.

## UI components

The UI is built with [shadcn/ui](https://ui.shadcn.com). Its CLI copies each module's source into
`src/components/ui/` (`button`, `card`, `dialog`, `table`, `badge`, …), so we own
the code and edit it directly. The modules use accessible Base UI primitives,
Tailwind, and CSS variables in `src/index.css`,
which gives one consistent look plus light/dark theming across the whole app.

Add a component with `npx shadcn@latest add <name>`, then build screens by
composing these primitives instead of hand writing styled markup.

## Config

Two layers, resolved in `lib/config.ts`:

- **Build-time:** `VITE_*` vars baked in by Vite (see `.env.example`). Used for
  local dev.
- **Runtime:** `window.__OCEAN_CONFIG__` from `public/config.js`, swapped in per
  deploy so one built image works across environments. Runtime wins over
  build-time.

`apiUrl` defaults to `/v1` (same origin), in production Caddy reverse-proxies
`/v1/*` to the backend (see `Caddyfile`).

## Running it

```sh
npm install
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build  → dist/
npm run lint       # ESLint
npm run vitest     # unit/component tests (single run)
npm run test       # Vitest + Cypress component tests
npm run test:e2e   # Cypress E2E, dev server must be running
```

## Build & deploy

`Dockerfile` builds the static bundle and serves it from `caddy:2-alpine`. Caddy
terminates TLS, does the SPA fallback, and proxies `/v1/*` to the backend. The
image is built and shipped by the deploy tooling: see [`ops/`](../ops/README.md).
