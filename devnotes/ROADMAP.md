# Ocean — Roadmap

## v1 done means

- `docker compose up` runs deps locally; `--profile full` runs the whole stack.
- Same stack running on three HTW VMs (`app-vm` / `pg-vm` / `mongo-vm`) with TLS at the edge, plus an `ops-vm` running the self-hosted GitLab runner.
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

### Phase 4 — Single local VM via Lima ✅

Rehearse the whole prod stack on one VM locally before touching anything at HTW.

- One Lima VM runs the full stack: frontend (Caddy :80), backend, `postgres_orm`, `pg_cluster`, `mongodb_cluster`, `openldap` (local stand-in for HTW LDAP).
- Bootstrap is bash for now (`ops/single-vm/bootstrap.sh`); becomes Ansible in the next phase.
- Secrets live in `ops/single-vm/env/*.env`, never in the repo.
- Verify: clean Lima up → working Ocean reachable on localhost; full login + DB-create flow passes.

### Phase 5 — Ansible takes over bootstrap ✅

Same single Lima VM, different provisioning mechanism. Replaces shell history with a checked-in source of truth.

- Base role (OS prep, Docker, deploy user, firewall) + app role (compose + env + ports).
- Inventory targets the Lima VM.
- Verify: second `ansible-playbook` run is a no-op (idempotency gate); stack still works.

### Phase 6 — Three local Lima VMs (mirror uni topology) ✅

Split the single VM into `app-vm` / `pg-vm` / `mongo-vm` on a Lima-internal network. Same Ansible, per-host roles.

- `app-vm`: frontend, backend, `postgres_orm`. Only public ports.
- `pg-vm`: `pg_cluster` (+ Adminer). DB port open to `app-vm` only.
- `mongo-vm`: `mongodb_cluster`. DB port open to `app-vm` only.
- Backend points at the other VMs by internal IP via the existing `*_HOSTNAME` seam.
- Verify: end-to-end login + DB-create across the three VMs; DB ports unreachable from any host other than `app-vm`; tear-down + redeploy clean.

### Phase 7 — GitLab CI pipeline (build only, no deploy) - BLOCKED by CICD runner setup

Get artifacts flowing through CI before there's anywhere real to deploy them.

- Stages: `test → build → push`. No deploy stage yet.
- Tagged backend + frontend images pushed to the GitLab Container Registry.
- Exact pipeline shape (caching, parallelism, tag scheme) decided when implementing.
- Verify: push to `main` produces tagged images; `docker pull` works from outside CI; the Lima VMs can consume those images instead of building locally.

### Phase 8 — Real-VM prep (certs, firewall, self-hosted runner) 

Last local-only phase. Resolve everything that cannot be tried for the first time on a non-resettable HTW VM.

- HTW-issued per-VM TLS cert + key: storage path, mount strategy, renewal cadence, CA root for the JVM trust store (LDAPS).
- Inbound source CIDRs confirmed: who may SSH, who may reach :80/:443, who may reach DB ports.
- Self-hosted GitLab runner on `ocean-ops` — HTW GitLab has no shared runners. Ansible role provisions Docker + `gitlab-runner`, registers against the project with a registration token from CI/CD settings, executor `docker`. Runner reaches the app/pg/mongo VMs over SSH; only `ocean-ops` needs egress to `gitlab.htw-berlin.de`.
- Verify: rehearse the runner role against a Lima stand-in for `ocean-ops`; a CI job picks up on the registered runner and runs a remote `ansible-playbook --check` against a target host; cert + CA-root mounting rehearsed end-to-end locally.

### Phase 9 — Deploy to HTW VMs ✅

Same artifacts, same playbooks, real targets. Dry-run first, every time.

- `app-vm` first, base role only → confirm SSH/firewall didn't lock us out → app role.
- Then `pg-vm` + `mongo-vm`; repoint `app-vm` backend at them.
- Apply the runner role to `ocean-ops`; register it against the HTW GitLab project; confirm the runner picks up a no-op job.
- TLS terminated at the frontend on `app-vm` (:80 → :443); HTW CA root in the backend JVM trust store; LDAPS verifies without bypasses.
- CI deploy stage flips from placeholder to `ansible-playbook` against the uni inventory, run by the `ocean-ops` runner, behind a manual approval gate.
- Verify: push to `main` → click deploy → new image live; full smoke (login + DB create + persistence across VM reboot).

See `plans/deployment.md` for the detailed phase-by-phase verify steps from Phase 4 onward.

### Phase 10 — Version upgrades (post-baseline)

DB servers off EOL + the driver/library bumps they force. Detailed runbook in `plans/upgrades.md`.

- Targets: Postgres 12 → **17** (both instances); Mongo 5 → **7** (LTS); pgjdbc 42.2.21 → 42.7.x (CVE-2024-1597); mongo-scala-driver 2.9.0 → 5.x; jackson align with Play 3.0.
- Two hard couplings: Mongo bump forces a `MongoDBEngine` rewrite (`Completed` type gone in driver 4.0); Postgres majors need dump/restore (PGDATA format change) — capture roles/globals, not just schema.
- `openldap` is on the frozen `bitnamilegacy` image and sits in the prod auth path — decision needed (pin / migrate image / move to HTW LDAP).
- Out of this phase: Scala 2.13 → 3 (deferred); frontend stays as-is (already fresh) bar an `npm audit` pass.
---

## TODOs

- **TODO-SECRETS** — Phase 8: stay on plain env files, or move to SOPS / Vault? maybe to gitlab secrets and secret files

## Future extensions

Observability (uptime probe → Prometheus/Grafana → log shipping). Engines parameterized-query refactor. Test coverage to a non-embarrassing number. Frontend data-layer consolidation, error boundary, JWT → httpOnly cookies. Architecture review (microservices? admin tool?). k8s / Helm / Terraform.
