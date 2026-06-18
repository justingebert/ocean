# Ocean frontend

The web app users log into to provision and manage their databases. A React 19
SPA (Vite + Tailwind 4) that talks to the Play backend over `/v1`.

## Stack

React 19 · Vite 6 · Tailwind 4 · Redux Toolkit + redux-saga (client state) ·
TanStack Query v5 (server state) · React Router 7 · Formik + Yup (forms) ·
axios + jose (API + JWT). Tests: Vitest + Cypress.

## Layout

Everything lives under `src/`:

| Path          | What it is                                                           |
| ------------- |----------------------------------------------------------------------|
| `views/`      | route-level screens (overview, databases, settings, sign-in, …)      |
| `layouts/`    | shells the views render inside                                       |
| `components/` | reusable UI: lists, modals, forms, navigation, stats                 |
| `api/`        | one axios client per resource (database, role, invitation, …) + auth |
| `hooks/`      | TanStack Query hooks wrapping the API clients                        |
| `redux/`      | store, slices and sagas: session/auth state                          |
| `types/`      | shared TypeScript types                                              |
| `config.ts`   | resolves runtime + build-time config into one `config` object        |

Tests are **colocated** (`foo.ts` + `foo.test.ts`); Cypress specs live in
`cypress/` (component) and `cypress/e2e/`.

## The model

- **Routing** (`views/index.tsx`) splits public (`/login`) from protected
  routes. `ProtectedRoute` gates everything behind `session.isLoggedIn`; screens
  are lazy-loaded behind a `Suspense` fallback.
- **Server state** is TanStack Query, never Redux. Hooks in `hooks/` call the
  axios clients in `api/`, which all hit the backend at `/v1`.
- **Client state** is Redux Toolkit + saga, effectively just the auth session.
- **Auth**: sign-in stores access + refresh JWTs in `localStorage`. The shared
  axios instance (`api/client.ts`) attaches the bearer token; a response
  interceptor catches `401`s, refreshes the access token once, and retries, 
  logging out if the refresh itself fails.

## Config

Two layers, resolved in `config.ts`:

- **Build-time:** `VITE_*` vars baked in by Vite (see `.env.example`). Used for
  local dev.
- **Runtime:** `window.__OCEAN_CONFIG__` from `public/config.js`, swapped in per
  deploy so one built image works across environments. Runtime wins over
  build-time.

`apiUrl` defaults to `/v1` (same origin),  in production Caddy reverse-proxies
`/v1/*` to the backend (see `Caddyfile`).

## Running it

```sh
npm install
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build  → dist/
npm run lint       # ESLint
npm run vitest     # unit/component tests (single run)
npm run test:e2e   # Cypress E2E, dev server must be running
```


## Build & deploy

`Dockerfile` builds the static bundle and serves it from `caddy:2-alpine`. Caddy
terminates TLS, does the SPA fallback, and proxies `/v1/*` to the backend. The
image is built and shipped by the deploy tooling: see [`ops/`](../ops/README.md).
