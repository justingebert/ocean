# Ocean — Work Log B


## 2026-10-25 — deployment simplifications
- One `deploy` job for app, pg and mongo instead of three; compose leaves unchanged services alone, so this removes "forgot to run deploy:pg" drift without extra restarts.
- Dropped Ansible path vars that the compose files hardcoded anyway, kept the proxy URL in one Ansible place, and made the Mongo combined PEM idempotent.

## 2026-10-21: Dozzle log monitoring on the ops VM
- Dozzle UI on ops (behind Caddy with its own TLS cert), agents on app/pg/mongo; linked from the admin page.
- Agent port restricted to the ops IP via DOCKER-USER, since Docker-published ports bypass INPUT rules.
- No login yet; container actions and shell pinned off. Next: Beszel for host metrics, then auth.

## 2026-10-20: decide for beszel and dozzle for monitoring and start implementation

## 2026-10-12: brainstorm monitoring and alerting stack
