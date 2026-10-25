# Ocean — Work Log B

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
