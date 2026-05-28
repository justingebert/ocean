# Ocean — Work Log

Short, append-only log of work on the research project. Newest entry at the top.

## Format

One section per discrete unit of work. Heading: `## YYYY-MM-DD — topic`. Then a few bullets, no file lists, no diff replay — that's what `git log` is for. If it'd take more than a minute to scan, it's too long.

## 2026-05-28
- get ldap running in prod vm (had issue with cert, was jsut a typo in the docker Volume)

## 2026-05-27
- open internal postgres on loopback docker
- configure firewall to let postgres talk to loopback via shh -l

## 2026-05-25 — version-upgrade roadmap
- analysed stack versions: PG 12 + Mongo 5 both EOL; pgjdbc 42.2.21 has a SQLi CVE; mongo driver 2.9 can't talk to Mongo 7
- wrote `plans/upgrades.md` (phases 10.0–10.6), tightened ROADMAP Phase 10 to point at it
- two couplings flagged: Mongo server bump forces a MongoDBEngine rewrite (`Completed` type gone in driver 4.0); PG majors need dump/restore with role/globals capture, not a tag swap
- targets set conservative LTS: PG 17, Mongo 7. Scala 3 + frontend deferred

## 2026-05-26 draft ldap cert
-  setup in backend docker image
- also test db connections using db tools, encountereds some issues:

## 2026-05-24 — add TLS
- new tls ansible role
- enforce tls on database connections
- update proxy to use tls
- check for ca trust on machines and jvm

## 2026-05-24 ansible-playbook run on all VMs, http working
- first real deployment on VM with ansible, readable without tls
- works great

## 2026-05-23 first real ansible against prod VM
- adjust firewall on app vm manually to test first ansible run
- failing docker install with curl
- failing pull because htw webproxy isnt configured in defualt docker deamon

## 2026-05-20 - clarify open quesitons, plan first deployment in detail from laptop to vm
- firewall rules for the VM?
- ansible roles 
- brainstorm about how to make deployment idempotent and not clutter the vms
- think about how to set up anisble user -> maybe bashscript

## 2026-05-20 - email for gitlab runner vm

## 2026-05-19 - brainstorm about how to manage secrets:
- 5 options considered: Ansible Valut, SOPS, Gitlab Vars, External Secret manager and manual env
- learning towards SOPS or gitlab vars
- gitlab vars seems better because of possible accident commits using sops

## 2026-05-19 — CI pipeline draft
- Added `.gitlab-ci.yml` skeleton: `test → build → deploy`, backend/frontend split in parallel, all jobs manual, main-only.
- Build stage builds + pushes to GitLab Container Registry (`sha` + `latest`). Deploy is a placeholder until Ansible is wired in.

## 2026-05-18/19 - migrate single vm local deployment to Ansible
- Replaced two-pass bash+ansible dance with a single ansible playbook: image builds moved into `community.docker.docker_image` tasks (tagged `build`), so `lima-up.sh` is now just `limactl start` + one `ansible-playbook` call.
- Builds run inside the VM against the Lima host-mount path, no rsync needed.
- Added `requirements.yml` for the docker collection; `python3-docker` SDK installed via apt; `force_build` var lets users skip rebuild on no-change runs.

## 2026-05-17 - plan out deployment in detail

## 2026-05-17 - first local lima vm setup
- use bash scripts, kinda janky but works
- openldap doesnt work on arm vm

## 2026-05-15 — Test out gl-ai container registry
- Tried pushing/pulling local image to the GitLab registry.
- Blocked: GitLab registry CA not trusted on laptop (TLS error).

## 2026-05-15 — Fix Backend Tests Deps and Format
- Fixed test dep paths, ran sbt format.

## 2026-05-13 — Clean up Frontend
- Removed non-source files, minor hygiene.

## 2026-05-13 — Simplify local dev and add current single-VM deploy
- Collapsed root compose include/override into one self-contained dev file. Default `up` = deps only; profiles add Adminer or the full app smoke path.
- Added `ops/single-vm/` as the current deploy target: frontend + backend + LDAP + all DBs on one Docker network, only frontend on :80.
- Goal: anyone should understand local dev and the current VM deploy by reading one compose file each.

## 2026-05-13 — Three-VM split: shared service fragments + per-VM compose (deprecated/scrapped)
- Tried a three-VM layout under `ops/` with shared service fragments + per-VM include + override files, plus role-based bootstrap scripts.
- Worked, but scrapped: too complex for the current phase. Replaced by the single-VM setup above.
- Notes for later: cross-VM networking and image registry were left as TBD; revisit when the university actually provides three VMs.

## 2026-05-11 — Phase 4a.1: single-VM prod overlay (deprecated/scrapped)
- Added a thin prod compose overlay: registry images instead of `build:`, DB/backend host ports stripped, frontend = public ingress on :80, restart always, backend env loaded from `/etc/ocean/`.
- Goal: unblock first VM smoke over plain HTTP without solving TLS or the registry first.

## 2026-05-11 — One `.env` to rule them all + Vite dev proxy
- Collapsed three `.env` files into one root `.env` with backend / frontend / compose sections. Vite reads it via `envDir: '..'`; compose interpolates `VITE_*` into build args.
- Added Vite dev proxy `/v1 → :9000` so dev matches prod's relative-URL setup.
- Result: no more drift between duplicated frontend env files.
- Deploy secrets: plan = GitLab CI/CD variables for v1, SOPS as upgrade path.

## 2026-05-10 — Phase 2: compose integration (full-stack profile)
- Wired backend + frontend into compose under a `full` profile. Default `up` stays deps-only; `--profile full` brings the whole stack. Added named volumes for the three DBs.
- Added Caddy reverse proxy `/v1/*` → backend so SPA can call the API on the same origin.
- Verified end-to-end: LDAP signin, create managed Postgres DB, state survives `down`/`up`.

## 2026-05-09 — Phase 1 (backend): Dockerfile + Play dist runtime
- Multi-stage backend image: JDK + sbt builds via `sbt dist`, JRE runs `bin/backend` as unprivileged user. Dependency layer cached before app sources.
- Verified: container boots, both DB pools connect, Mongo reachable, signin endpoints respond. ~555 MB image.
- Follow-ups: try sbt-native-packager; drop test deps from runtime; switch logback to stdout-only; add `/healthz` + Dockerfile HEALTHCHECK.

## 2026-05-09 — Phase 1 (frontend): Dockerfile + Caddy serve
- Multi-stage frontend image: Node builds Vite bundle, Caddy serves `dist/`. Build-time `VITE_*` args bake env into the bundle.
- Caddyfile: SPA fallback for unknown paths, but `/assets/*` 404s cleanly (so broken bundles don't masquerade as 200s). Immutable cache for hashed assets.
- Verified: serves root, deep links, missing assets 404, `VITE_*` makes it into JS. ~90 MB image.

## 2026-05-09 — Phase 0: config hygiene + cleanup
- Consolidated per-env Play config into one file per subsystem with `default → ${?VAR}` overrides. `application.conf` is the single entry point.
- Added root `.env.example` + gitignore, pinned floating compose image tags, removed Logstash logging path and dead sbt files.
- Goal: one image, env-agnostic, configured purely via env vars — prereq for containerization.

## 2026-05-04 — Mongo create returns 400 (auth fails)
- Pinned compose mongo image to `mongo:5` to match the old Scala mongo driver (2.9.0).
- Diagnosed: backend was hitting host's local mongo instead of compose mongo.
- Follow-ups: wrap `addInstance` + engine call in a single tx (or compensate on engine failure); upgrade mongo driver to 4.11.x so we can use mongo:8.

## 2026-05-04 — Local-run unblock + plan refresh
- Dropped old frontend, removed MySQL from compose.
- Pointed pg_cluster dev config at local compose Postgres instead of the prod HTW host.
