# Ocean — Roadmap

## v1 done means

- `docker compose up` runs deps locally; `--profile full` runs the whole stack.
- Same stack running on three HTW VMs (`app-vm` / `pg-vm` / `mongo-vm`) with TLS at the edge.
- Every VM reproducible from scratch via Ansible — rehearsed in Lima first.
- Push to `main` → image in registry → one-click (gated) deploy via GitLab CI.

Out of v1: observability stack, SQL-injection refactor, architecture changes, k8s.

---

## Phases

### Phase 0 — Config hygiene ✅

- simplify and consolidate env vars and config files. Remove unused ones. Make sure all secrets are actually secret, removed certs from git history,...

### Phase 1 — Dockerfiles in isolation ✅

- Frontend (Vite → Caddy) + backend (multi-stage sbt dist → JRE), `.dockerignore` both.

### Phase 2 — Compose integration ✅

- `profiles: ["full"]` on `backend` + `frontend`. Caddy reverse-proxies `/v1` → `backend:9000`. Named volumes for DB persistence.

### Phase 3 — Code quality 

- `/healthz` + `/ready` endpoints → wire compose `healthcheck:` + `depends_on: condition: service_healthy`. Removes startup races.
- Permission TODOs in `RoleService` / `InvitationService`. MongoDB hardcoded port. `npm audit`.
- SQL-injection in `engines/*` — tracked issue, not a fix.

### Phase 4 — Single local VM via Lima

Rehearse the whole prod stack on one VM locally before touching anything at HTW.

- One Lima VM runs the full stack: frontend (Caddy :80), backend, `postgres_orm`, `pg_cluster`, `mongodb_cluster`, `openldap` (local stand-in for HTW LDAP).
- Bootstrap is bash for now (`ops/single-vm/bootstrap.sh`); becomes Ansible in the next phase.
- Secrets live in `ops/single-vm/env/*.env`, never in the repo.
- Verify: clean Lima up → working Ocean reachable on localhost; full login + DB-create flow passes.

### Phase 5 — Ansible takes over bootstrap

Same single Lima VM, different provisioning mechanism. Replaces shell history with a checked-in source of truth.

- Base role (OS prep, Docker, deploy user, firewall) + app role (compose + env + ports).
- Inventory targets the Lima VM.
- Verify: second `ansible-playbook` run is a no-op (idempotency gate); stack still works.

### Phase 6 — Three local Lima VMs (mirror uni topology)

Split the single VM into `app-vm` / `pg-vm` / `mongo-vm` on a Lima-internal network. Same Ansible, per-host roles.

- `app-vm`: frontend, backend, `postgres_orm`. Only public ports.
- `pg-vm`: `pg_cluster` (+ Adminer). DB port open to `app-vm` only.
- `mongo-vm`: `mongodb_cluster`. DB port open to `app-vm` only.
- Backend points at the other VMs by internal IP via the existing `*_HOSTNAME` seam.
- Verify: end-to-end login + DB-create across the three VMs; DB ports unreachable from any host other than `app-vm`; tear-down + redeploy clean.

### Phase 7 — GitLab CI pipeline (build only, no deploy)

Get artifacts flowing through CI before there's anywhere real to deploy them.

- Stages: `test → build → push`. No deploy stage yet.
- Tagged backend + frontend images pushed to the GitLab Container Registry.
- Exact pipeline shape (caching, parallelism, tag scheme) decided when implementing.
- Verify: push to `main` produces tagged images; `docker pull` works from outside CI; the Lima VMs can consume those images instead of building locally.

### Phase 8 — Real-VM prep (certs, firewall, CI reachability)

Last local-only phase. Resolve everything that cannot be tried for the first time on a non-resettable HTW VM.

- HTW-issued per-VM TLS cert + key: storage path, mount strategy, renewal cadence, CA root for the JVM trust store (LDAPS).
- Inbound source CIDRs confirmed: who may SSH, who may reach :80/:443, who may reach DB ports.
- CI ↔ VM reachability spike: can the GitLab runner SSH the VMs, or do we need a self-hosted runner on `app-vm` / a manual deploy path?
- Verify: a CI job runs a remote command against a target host (Lima stand-in is fine); cert + CA-root mounting rehearsed end-to-end locally.

### Phase 9 — Deploy to HTW VMs

Same artifacts, same playbooks, real targets. Dry-run first, every time.

- `app-vm` first, base role only → confirm SSH/firewall didn't lock us out → app role.
- Then `pg-vm` + `mongo-vm`; repoint `app-vm` backend at them.
- TLS terminated at the frontend on `app-vm` (:80 → :443); HTW CA root in the backend JVM trust store; LDAPS verifies without bypasses.
- CI deploy stage flips from placeholder to `ansible-playbook` against the uni inventory, behind a manual approval gate.
- Verify: push to `main` → click deploy → new image live; full smoke (login + DB create + persistence across VM reboot).

See `plans/deployment.md` for the detailed phase-by-phase verify steps from Phase 4 onward.

### Phase 10 — Modernization (post-baseline, parallel)

- Scala 2.13 → 3 feasibility (Play, Slick, jwt-scala, ScalaTest cross-build); JDK pin; sbt version.
- Postgres 12 → current LTS; Mongo 5 → current LTS. Driver/wire-protocol compat, dump/restore migration.
- Frontend audit + bumps.
---

## TODOs

- **TODO-SECRETS** — Phase 8: stay on plain env files, or move to SOPS / Vault? maybe to gitlab secrets and secret files

## Future extensions

Observability (uptime probe → Prometheus/Grafana → log shipping). Engines parameterized-query refactor. Test coverage to a non-embarrassing number. Frontend data-layer consolidation, error boundary, JWT → httpOnly cookies. Architecture review (microservices? admin tool?). k8s / Helm / Terraform.
