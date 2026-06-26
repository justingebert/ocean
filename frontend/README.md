# Ocean frontend

The web app users log into to provision and manage their databases. A React 19
SPA (Vite + Tailwind 4) that talks to the Play backend over `/v1`.

## Stack

React 19 · Vite 6 · Tailwind 4 · TanStack Query v5 · React Router 7 ·
Formik + Yup · axios + jose. Tests: Vitest + Cypress.

## Layout

Everything lives under `src/`:

| Path          | What it is                                                           |
| ------------- | -------------------------------------------------------------------- |
| `views/`      | route-level screens (overview, databases, settings, sign-in, …)      |
| `layouts/`    | shells the views render inside                                       |
| `components/` | reusable UI: lists, modals, forms, navigation, stats                 |
| `api/`        | one axios client per resource (database, role, invitation, …) + auth |
| `auth/`       | auth context, token storage, login/logout/session restore            |
| `hooks/`      | TanStack Query hooks wrapping the API clients                        |
| `navigation/` | canonical route paths/builders and sidebar navigation metadata       |
| `types/`      | shared TypeScript types                                              |
| `config.ts`   | resolves runtime + build-time config into one `config` object        |

Tests are **colocated** (`foo.ts` + `foo.test.ts`); Cypress specs live in
`cypress/` (component) and `cypress/e2e/`.

## The model

- **Routing** lives in `views/index.tsx`, with canonical paths in
  `navigation/routes.ts`. Visible sidebar/topbar entries live in
  `navigation/navigation.ts`.
- **Auth/session** is owned by `auth/AuthProvider.tsx`. It restores sessions,
  logs in/out, stores tokens, sets the bearer token, and clears TanStack Query
  cache on session end.
- **Server state** is TanStack Query. Hooks in `hooks/` and screens call the API
  clients in `api/`, which all use the shared axios instance.
- **Token refresh** is handled by `api/client.ts`: a `401` triggers one refresh
  attempt, retries the original request, and expires the session if refresh
  fails.

## Config

Two layers, resolved in `config.ts`:

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
