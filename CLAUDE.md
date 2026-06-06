# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Three deployable parts plus docs:

- `backend/` — Scala 2.13 Play Framework REST API (the "managing" app). Package root: `com.htwhub.ocean`.
- `frontend/` — current React 19 + Vite + Tailwind 4 UI (professor uploaded separately after the initial repo drop).
- `docs/` — Docsify site (static).

`docker-compose.yaml` spins up the local development dependencies only (OpenLDAP, Postgres × 2, MongoDB, Adminer). The backend and frontend run directly via `sbt run` / `npm run dev` against those deps; their container images are built for the VM deploy by Ansible, not run locally. Both Dockerfiles still exist:
- `frontend/Dockerfile` — multi-stage Vite build → `caddy:2-alpine` serving `/usr/share/caddy`. `VITE_*` injected via `--build-arg` at build time. `frontend/Caddyfile` terminates TLS for `OCEAN_HOSTNAME` (cert mounted at `/etc/caddy/tls`) and does the SPA fallback; it is the only Caddyfile — no separate dev/prod split.
- `backend/Dockerfile` — multi-stage `eclipse-temurin:17-jdk-jammy` + sbt → `sbt dist` → `eclipse-temurin:17-jre-jammy` runtime running `bin/backend` as the unprivileged `play` user. All runtime config (DB hosts, secrets, LDAP) flows in via env vars resolved by HOCON `${?VAR}` overrides.

Deploy target is the three-VM HTW setup: `ops/compose/app/docker-compose.yml` (frontend + backend + internal Postgres), `ops/compose/pg/docker-compose.yml` (managed Postgres), `ops/compose/mongo/docker-compose.yml` (managed MongoDB). Provisioned via `ops/ansible/` against `inventory.yml`. VM env files are rendered from role templates; real deploy secrets come from local/GitLab `OCEAN_*` environment variables. TLS files come from `OCEAN_TLS_SRC` locally or GitLab secure files in CI.

## Running things locally

Development dependencies (LDAP, three DB clusters):

```sh
docker compose up                              # all local dev deps (LDAP, 3 DB clusters, Adminer)
```

Backend (Play, SBT) from `backend/`:

```sh
sbt run               # dev mode — defaults in application.conf match the local docker-compose deps
sbt test              # ScalaTest
sbt cov               # clean + coverage + test + report
sbt format            # alias: scalafmt + test:scalafmt
sbt formatCheck       # alias: scalafmtCheck + test:scalafmtCheck
sbt dist              # production build
```

A single backend test: `sbt "testOnly com.htwhub.ocean.service.UserServiceSpec"` (package under `test/com/htwhub/ocean/...`).

Frontend from `frontend/`:

```sh
npm run dev              # Vite dev server
npm run build            # tsc -b && vite build
npm run lint             # ESLint
npm run vitest           # unit/component tests (single run)
npm run vitest -- path/to/file.test.ts   # single file
npm run cypress:component    # Cypress component tests — dev server must NOT be running
npm run test:e2e             # Cypress E2E — dev server MUST be running
npm run storybook
```

## Backend architecture

Layered Play app wired with Guice. Request flow top-down:

1. `conf/routes` → `controllers/*Controller` (HTTP + JSON serialization via `serializers/`).
2. Controllers call **Managers** (`managers/`) — business-logic orchestration, permissions, cross-resource rules. Managers are the place that ties together DB-row persistence with the *real* database cluster operations.
3. Managers use two distinct collaborators:
   - **Services** (`service/`) — CRUD for the internal metadata (users, instances, roles, invitations). Backed by `repositories/` (Slick/`play-slick`) against the `postgres_orm` database.
   - **Engines** (`engines/PostgreSQLEngine`, `engines/MongoDBEngine`) — execute DDL/DML against the **managed** DB clusters (`pg_cluster`, `mongodb_cluster`) that Ocean provisions for end-users. This is where `CREATE DATABASE`, `CREATE ROLE`, mongo user management, etc. live.
4. `OnStartupService` is bound as an eager singleton in `Module.scala` and runs provisioning checks (e.g. creating the LDAP group role in Postgres) at boot.

Auth: LDAP bind via `LdapService` → JWT issued by `TokenService` (jwt-scala). `AuthManager` / `AuthController` handle signin + refresh. Protected controllers validate JWT and derive the user from it.

Config is one file per subsystem under `backend/conf/`: `application.conf` is the entry point and `include`s `slick.conf`, `pg_cluster.conf`, `mongodb_cluster.conf`, `ldap.conf`, `swagger.local.conf`, `concurrent.local.conf`. Each subsystem file follows the HOCON pattern of `key = "default"` followed by `key = ${?VAR}` — defaults boot dev cleanly against the local docker-compose deps; env vars override per environment (compose `.env`, systemd unit, k8s secret). When adding new infrastructure, follow this same default-then-override pattern; don't reintroduce per-env `*.dev.conf` / `*.production.conf` splits.

Schema evolutions live in `conf/evolutions/default/*.sql` (Play evolutions, `!Ups` / `!Downs`) — these migrate the **internal ORM** DB only, not the managed clusters.

Adding a new managed database engine (one of the research-project targets) means: new `XxxEngine` in `engines/`, wire it into the relevant `Manager`, add a cluster block to `docker-compose.yaml`, create `conf/xxx_cluster.conf` following the default-then-`${?VAR}` pattern, add an `include` line to `application.conf`, and document the new env vars in `.env.example`.

## Frontend architecture

- React 19 + Vite 6 + Tailwind 4 (`@tailwindcss/vite` plugin, not PostCSS).
- State: Redux Toolkit slices + redux-saga for side effects (`src/redux/{slices,sagas,store.ts,reducers.ts}`).
- Data fetching: **TanStack Query v5** for server state on top of axios clients in `src/api/*Client.ts` — each resource (database, role, invitation, metric, user, session) has its own client + colocated `*.test.ts`.
- Routing: React Router 7 (`src/views/*` are route-level screens; `src/layouts/` wraps them).
- Forms: Formik + Yup.
- Auth token: `jose` for JWT handling client-side.
- Tests are **colocated** next to sources (`foo.ts` + `foo.test.ts`); Vitest setup in `vitest.setup.ts` / `vitest.config.ts`. Cypress component specs under `cypress/`, E2E under `cypress/e2e/`.
- Backend API version prefix is `/v1` — see `backend/conf/routes` for the surface.

## Research-project context

This repo is the starting point for a university research project. Explicitly on the table (from the professor): dockerize the app, build a CI/CD pipeline, extend platform functionality, connect additional DB systems, build an admin tool for the managed DB systems, move toward microservices, bug-fix and update libraries, and add monitoring. The current shipping plan lives in `devnotes/ROADMAP.md`.

## Conventions worth knowing

- Scala formatting: scalafmt (`sbt format` before committing). `sbt formatCheck` is the gate.
- Backend package path mirrors directory: `com.htwhub.ocean.<layer>` — keep that alignment when adding files.
- Engine methods build SQL with `sql"""... #${name}"""` splices — identifiers (db name, role name) are interpolated unescaped. Any new engine operation that accepts user-influenced names must validate them upstream (managers already do this for create/delete flows); don't relax that.
- Secrets (`play.http.secret.key`, `jwt.secret_key`, LDAP creds, cluster passwords) come from env vars / `*.dev.conf` placeholders — never commit real values.

## Work log — required after every meaningful change

`./devnotes/WORK_LOG.md` is the source for the final research-project report. Append a new dated section at the top after every meaningful unit of work.

- Heading: `## YYYY-MM-DD — topic`. Then a few bullets — whatever shape fits (free notes, or **Did** / **Why** / **Result** / **Notes** / **Problems**).
- High-level only: topic + what was done + why if non-obvious. No file lists, no diff replay — `git log` covers that.
- One section per discrete unit of work. Skip trivial stuff (typos, formatting).
- If the entry takes more than a minute to scan, it's too long.


## Coding Guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
