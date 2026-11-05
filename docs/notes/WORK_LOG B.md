# Ocean — Work Log B

## 2026-11-05: Ops VM gets its TLS certificate and is deployed from CI
- The ops VM now has its own certificate (Secure Files, like the other three), as the base for exposing the monitoring UIs over HTTPS.
- The old `deploy:ops` job could not work: the CI job runs in a container on ops and deploys ops itself, so its SSH back into the host was dropped by the firewall, and the firewall/base/runner roles restart Docker or the runner, which would kill the running job.
- Split ops in two: the one `deploy` job now covers all four VMs but on ops applies only TLS and the monitoring stack; firewall, Docker and the runner there moved to a separate laptop-run playbook (`ops-bootstrap.yml`). The hidden `deploy:ops` job and its `DEPLOY_OPS` switch are gone, and the ops firewall lets job containers SSH to their own host.

## 2026-11-01: Beszel resource monitoring on ops (basic, SSH tunnel)
- Added Beszel for CPU, RAM, disk, network and per-container stats: hub on the ops VM, an agent on every VM including ops itself (the runner VM is the likeliest to fill its disk unnoticed).
- Uses Beszel's SSH mode for now: the hub connects to the agents, the same direction as Dozzle, so it works before the ops TLS certificate exists. Agent port 45876 only accepts the ops IP; since agents use host networking, that rule lives in the host's INPUT chain instead of `DOCKER-USER`. The ops agent talks to the hub through a shared unix socket.
- Kept deliberately minimal: admin via the first-run wizard, systems added once in the UI, hub public key committed by hand after the first start (it is not a secret). Planned follow-up once the certificate arrives: WebSocket mode with a universal token (agents self-register), users from config, and HTTPS on `/resources` next to Dozzle on `/logs`.
- Hub and agents are pinned to the same exact tag in every compose file.

## 2026-10-27: Deploys pull fresh third-party images (PHP2Shell)
- PHP2Shell (CVE-2026-109618/-109619, unauthenticated PHP RCE) affects the PHP that Adminer runs on. The official `adminer:5` image was rebuilt on PHP 8.4.27, the fixed version, so no image bump was needed.
- But deploys never picked it up: the compose tasks only pulled images missing on the VM, so the moving tags (`adminer:5`, `postgres:18.4`, `mongo:8.0`, …) stayed on the first copy ever downloaded. Every third-party image now has `pull_policy: always` in its compose file, so any `docker compose up` (deploy or manual) pulls. Set in compose rather than Ansible because the app role can't pull everything: local dev uses locally built backend/frontend images.
- Trade-off: a deploy can briefly restart a managed DB container when upstream has published a rebuilt image. Deploys are manual, so the timing stays controllable.

## 2026-10-25: Frontend healthcheck no longer reports unhealthy
- Dozzle flagged the frontend as unhealthy although the site worked: the healthcheck hit port 80, which only redirects to HTTPS for the real hostname, so the check failed the TLS handshake on `127.0.0.1`.
- Port 80 now answers `/healthz` directly and the healthcheck targets it; it proves Caddy is up, not that TLS is fine.

## 2026-10-25: Dozzle log hub on ops (simplified redo)
- Dozzle hub on the ops VM, agents in the app/pg/mongo stacks, so logs and container stats of all VMs are in one place.
- Agent port 7007 is reachable only from the ops IP: an agent hands out full log and exec access to anyone who can connect, and its built-in cert is shared by every Dozzle install.
- No login yet, so the UI is bound to localhost on ops and reached via SSH tunnel; proper access (Caddy + TLS + auth) is the next step.
- Ops now gets the same managed firewall as the other VMs: its stock HTW script blocked the tunnel (no Docker-bridge exception) and still had the `if-up` restore hook that drops Docker's rules.

## 2026-10-25: Keep the app's internal Postgres off host ports
- Confirmed the backend is the only application client of Ocean's metadata database and connects over the Compose network; removed the app VM's localhost port mapping.
- Administrative access uses a command inside the database container. Local development keeps its host port because the backend runs outside Docker there.


## 2026-10-25 — firewall actually filters container traffic
- Review found the HTW-only inbound rules were dead: Docker-published ports are DNAT'd and pass FORWARD, never INPUT, so DBs and app were open to any source that could route to the VM. The source filter now lives in Docker's `DOCKER-USER` chain; per-port INPUT rules and the LDAPS OUTPUT exception (also bypassed by containers) are gone, and the compose `ports:` are the single list of what is open.
- Replaced the `if-up.d` iptables-restore hook with a boot-time systemd unit. The hook restored a snapshot without Docker's rules on every networking restart, cutting off all containers until Docker restarted.

## 2026-10-25 — Docker log rotation
- Docker's default json-file logs never rotate; capped at 3 × 10 MB per container so small VMs can't fill their disk with logs.

## 2026-10-25 — deployment simplifications
- One `deploy` job for app, pg and mongo instead of three; compose leaves unchanged services alone, so this removes "forgot to run deploy:pg" drift without extra restarts.
- Dropped Ansible path vars that the compose files hardcoded anyway, kept the proxy URL in one Ansible place, and made the Mongo combined PEM idempotent.

## 2026-10-21: Dozzle log monitoring on the ops VM
- Dozzle UI on ops (behind Caddy with its own TLS cert), agents on app/pg/mongo; linked from the admin page.
- Agent port restricted to the ops IP via DOCKER-USER, since Docker-published ports bypass INPUT rules.
- No login yet; container actions and shell pinned off. Next: Beszel for host metrics, then auth.

## 2026-10-20: decide for beszel and dozzle for monitoring and start implementation

## 2026-10-12: brainstorm monitoring and alerting stack
