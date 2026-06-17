# Frontend

This is a frontend project built using **React 19**, **Vite**, and **TailwindCSS**. It utilizes **Redux Toolkit** for state management, **React Router** for navigation, and **TanStack Query** for data fetching.

## Installation

### Prerequisites

- **Node.js** (Latest LTS version recommended)
- **npm** (Bundled with Node.js)

### Setup

```sh
cd frontend
npm install
```

## Scripts

```sh
npm run dev                      # Vite dev server
npm run build                    # production build
npm run preview                  # serve built output
npm run lint                     # ESLint
npm run vitest                   # unit/component tests
npm run vitest:coverage          # Vitest coverage report
npm run cypress:component        # Cypress component tests (dev server must NOT be running)
npm run test:e2e                 # Cypress E2E tests (dev server must be running)
npm run test                     # Vitest + Cypress component tests
npm run generate-coverage-report # unified NYC report (copy vitest coverage-final.json to .nyc_output first)
```
