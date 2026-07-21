# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository.

## Repository layout

Four parts, each with its own README that goes deeper than this file:

| Path          | What it is                                                                    | Read                                           |
| ------------- | ----------------------------------------------------------------------------- | ---------------------------------------------- |
| `backend/`    | Scala 2.13 Play REST API, package root `com.htwhub.ocean`                     | [`backend/README.md`](backend/README.md)       |
| `frontend/`   | React 19 + Vite + Tailwind 4 SPA                                              | [`frontend/README.md`](frontend/README.md)     |
| `deployment/` | Infrastructure as Code — Ansible + per-VM Compose stacks                      | [`deployment/README.md`](deployment/README.md) |
| `docs/`       | Plain-markdown guides (local dev, deploy, operations, provisioning, handover) | [`docs/`](docs/)                               |

Ocean provisions **managed** PostgreSQL and MongoDB databases for end users. Keep
the distinction straight: the _internal_ database (`postgres_orm`) stores Ocean's
own metadata; the _managed clusters_ (`pg_cluster`, `mongodb_cluster`) are what
users get. Different code paths, different config files.

## Running things locally

`docker-compose.yaml` at the root starts **only the dev dependencies** (OpenLDAP,
Postgres × 2, MongoDB, Adminer). The backend and frontend run directly against
them; their images are built for the VM deploy, not run locally.

```sh
docker compose up                 # dev deps
cd backend  && sbt run            # :9000 
cd frontend && npm run dev        # :5173
```

Full setup, seeded logins, and troubleshooting: [`docs/local-dev.md`](docs/local-dev.md).

**The CI gates** — run these before calling work done:

```sh
cd backend  && sbt formatCheck test
cd frontend && npm run lint && npm run format:check && npm run build && npm run vitest
```

Useful extras: `sbt "testOnly com.htwhub.ocean.service.UserServiceSpec"` (single
backend test), `sbt cov` (coverage), `sbt format` (scalafmt — run before
committing), `npm run vitest -- path/to/file.test.ts`,
`npm run cypress:component` (dev server must **not** be running),
`npm run test:e2e` (dev server **must** be running).

## Conventions

Only the things not covered by the sub-READMEs.

**Backend**

- Package path mirrors the directory: `com.htwhub.ocean.<layer>`.
- Engines build SQL with `sql"""... #${name}"""` splices — identifiers (database
  name, role name) are interpolated **unescaped**. Any new engine operation
  taking a user-influenced name must be validated upstream; the managers already
  do this for create/delete. Don't relax it.
- Config is one HOCON file per subsystem under `conf/`, each following
  `key = "default"` then `key = ${?VAR}`: defaults boot dev cleanly, env vars
  override per environment. Don't reintroduce per-env `*.dev.conf` /
  `*.production.conf` splits.
- Secrets come from env vars only — never commit real values.

**Frontend**

- Always use the `@/` alias for cross-directory imports; `./` only for
  same-folder siblings. Parent-relative `../` is banned by an ESLint
  `no-restricted-imports` gate — note it lints `import`/`export`, not
  `vi.mock()` string arguments, so keep those on `@/` by hand.
- Dependency direction is **shared → features → app**, enforced by ESLint.
  Prefer direct imports over `index.ts` barrels.

**Adding a managed database engine** (a stated research-project goal): new
`XxxEngine` in `engines/`, wire it into the relevant manager, add a cluster
service to `docker-compose.yaml`, add `conf/xxx_cluster.conf` following the
default-then-`${?VAR}` pattern, `include` it from `application.conf`, and
document the new env vars.

## Research-project context

This repo is a university research project. On the table, from the professor:
dockerize the app, build CI/CD, extend platform functionality, connect
additional DB systems, build an admin tool for the managed DB systems, move
toward microservices, bug-fix and update libraries, add monitoring.

The project is being handed over — see [`docs/handover.md`](docs/handover.md)
for current state, known gaps, and open TODOs.

## Work log, required after every meaningful change

Append a dated section to the **top** of [`docs/notes/WORK_LOG.md`](docs/notes/WORK_LOG.md).
It is the source material for the final report.

- Heading `## YYYY-MM-DD — topic`, then a few bullets.
- High level only: what was done, and why if non-obvious. No file lists, no diff
  replay — `git log` covers that.
- One section per discrete unit of work; skip trivial stuff. If it takes more
  30 seconds to scan, it's too long.

## Working style

- State assumptions; if a request has multiple readings, ask rather than pick
  silently. If a simpler approach exists, say so.
- Write the minimum that solves the problem — no speculative abstractions,
  configurability, or error handling for impossible cases.
- Keep changes surgical: match surrounding style, don't refactor what isn't
  broken, don't fix adjacent code you weren't asked about. Clean up orphans your
  own change created; mention pre-existing dead code rather than deleting it.
- Define what "done" looks like before starting, then verify it.
