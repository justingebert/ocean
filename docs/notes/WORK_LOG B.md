# Ocean — Work Log B

## 2026-11-26: UI polish: greeting, relative expiry, copy confirmation
- The databases page greets by name ("Good morning, …") with one status line: how many databases, and how many expire within 30 days.
- Expiry is shown as relative time ("in 6 months") with a status dot that turns amber within 30 days and red once past; the exact date is in a tooltip. This replaces red date text in the list, admin list and overview.
- Copy buttons confirm in place: the icon turns into a check for 1.5 s instead of a success toast; only a failure still toasts. shadcn has no standalone copy component. Its new code-block has one, but it pulls in the shiki highlighter, so a small own CopyButton modelled on it was written instead.

## 2026-11-26: Review follow-ups for the UI cleanup
- All delete confirmations now behave the same: the dialog shows a spinner until the delete finishes, then closes, and failures are toasted. Before, only the detail page waited; the admin list and the users panel closed at once, and a failed admin delete was silent.
- People are shown by full name everywhere (account menu, admin users, invitations) instead of a mix with "F. Last".
- Smaller consistency fixes: one shared date formatter, the database detail header reuses the page header, the dark-mode control is a standard menu checkbox item (a checkmark instead of the switch), and engine logos next to a name are decorative.
- The Cypress e2e specs still target the old UI (the /overview route, old button texts). They are not run in CI and are left for a separate change.

## 2026-11-26: Dark-mode switch in the account menu
- The Light / Dark / System radio list in the account menu is now a single "Dark mode" switch. Until someone flips it the app follows the OS setting; flipping it stores an explicit light or dark choice in the browser (next-themes already persisted the theme, so only the UI changed). There is no way back to "follow system" short of clearing site data, which seemed an acceptable trade for the simpler control.
## 2026-11-26: Frontend UI cleanup
- Reviewed the frontend after the shadcn migration: it worked, but looked like a template (pill-shaped everything, marketing-sized headings, cards inside cards, an Overview page that only repeated the sidebar). Fixed it in small steps, one commit each.
- Bugs first: deleting a database user or (as admin) any database now asks for confirmation; the Users and Invitations tabs get empty states; the German FAQ is now English and all dates share one format; the logo stays visible in dark mode. Removing an invitation still has no confirmation because it can simply be re-sent.
- Switched the shadcn style from `luma` to `nova` (small radii, flat panels, 32px controls), cut the palette to one accent colour, and gave pages an app-sized type scale. The components had no local changes, so they were re-added from the registry.
- The desktop top bar is gone: logo, "New database" and the account menu (now with the theme switch) live in the sidebar. Databases is the home page; `/overview` redirects there. Database rows are real links, so the list works by keyboard.
- Database page leads with the connection string, deleting moved into a "…" menu, admin list shows owners by username. Labels and toasts were unified ("New database", "Add user", "Couldn't …").
- The Cypress e2e suite (not in CI) was already failing on `main` (19 of 21); the branch keeps the same two passing tests. Unit and component tests all pass.
## 2026-11-26: Frontend switched to shadcn's `cn` package
- shadcn now ships its class-name helper as its own `cn` npm package, which replaces clsx and tailwind-merge with the same output. Migrated with the official `shadcn migrate cn`, then pointed every import straight at `cn` and dropped the local `lib/utils` wrapper, so new components from the CLI and our own code use the same import.
- The `utils` alias stays in `components.json` only because the CLI refuses the config without it. It no longer points at a real file.

## 2026-11-26: Database expiry, part 3: UI
- The database page shows the expiry date with a Renew button for the owner, or "Never expires". The databases list and the admin list get an expiry column, highlighted in red from 30 days before expiry, so the first reminder mail and the UI warning line up.
- Admins switch "never expires" per database directly in the admin list.
- No Renew button on never-expiring databases, matching the backend, where a renew leaves the admin's exemption alone.

## 2026-11-24: Database expiry, part 2: reminder mails and daily cleanup job
- A daily job in the backend reminds owners 30, 7 and 1 day(s) before expiry and deletes a database once it has expired and all three reminders were actually sent, followed by a confirmation mail. Mails go through the HTW relay already used for the Beszel alerts, German first, then English, with a link to the database page and how to export it.
- Runs at a fixed time (20:00) instead of on boot, so redeploys can't send several reminders on one day. At most one reminder per run: after an outage or a failed mail the missing ones catch up day by day, and the date in the mail moves out accordingly, so nobody gets less warning than promised.
- A renew while a reminder is being sent can't be overwritten: the reminder only counts if the database is still in the state the job read.
- Off by default and mails mocked; production gets the switches in its env file, still off. Tested end to end against the local stack: reminder sent and counted, expired database dropped from the cluster, never-expiring one untouched.
- A review found five holes, all fixed: the job now refuses to run while mails are mocked (logged-only reminders would have counted toward deletion); it rereads a database right before deleting it, so a renew during the run still saves it; the next run is planned only after the previous one finished, from the Berlin calendar day (no drift at daylight saving changes, no overlapping or catch-up runs); the date in the mail is the day of the run that actually deletes; and the frontend now returns to the requested page after login, so the mail link lands on the database.

## 2026-11-17: Database expiry, part 1: expiry dates and renew API
- Every database now has an expiry date (creation + 180 days, configurable) and a count of reminders sent. Existing databases get 180 days from the deploy, hard-coded in the migration because migrations can't read the app config.
- Owners can renew a database (a full lifetime from now); admins can mark one as never expiring and switch it back. Both reset the reminder count, so a renewed database goes through the full warning sequence again. Renewing a never-expiring database changes nothing, so owners can't undo an admin's exemption.
- Nothing is deleted or emailed yet; that comes with the mail service and the daily job.

## 2026-11-17: Planned automatic database expiry
- Planned the professor's "auto-delete old databases" admin feature (plan in `docs/plans/db-expiry.md`). Each database gets an expiry date (6 months, configurable) that the owner can renew. Owners get reminder emails 30, 7 and 1 day(s) before deletion through the HTW mail server already proven with Beszel, and admins can exempt databases.
- Chose age-plus-renew over detecting inactivity: Postgres and MongoDB don't record a "last used" time, so inactivity would need daily snapshots of activity counters, which counter resets and Ocean's own traffic make unreliable. Inactivity detection can come later as an automatic renew without changing the design.
- Safety choices: a database is only deleted once every reminder has actually been sent, the whole feature is off by default, and existing databases get a fresh 6 months from deploy, so the first deletions happen about 6 months after rollout.

## 2026-11-12: Ansible cleanup for maintainability
- Reviewed the Ansible setup with handover in mind (about 1,100 lines). It was mostly lean, so the cleanup only removed code a reader would have to puzzle over without it ever mattering: checks for an outbound proxy that is always set, a configurable runner setting that is never changed, and a one-time migration task for the old firewall hook.
- Deploy secrets were checked twice, by a shell loop in the CI job and by the asserts in the Ansible roles. Only the asserts remain, since they also run on a laptop deploy and check length and placeholder values.
- Deliberately left as is: the repeated stage, start and restart steps in the four VM roles. A shared role would save lines but hide what each VM does; four roles that read top to bottom are easier to hand over.

## 2026-11-12: Container actions in Dozzle
- Dozzle can now start, stop, restart, remove and update containers and free disk space (unused images, stopped containers, build cache) on every VM from the browser, so routine fixes like a full disk no longer need SSH.
- It is one switch on the hub. The agents never enforced it: anyone holding the hub's cert pair could already do this, so access is still guarded by the Dozzle login and the agents only trusting our own hub.

## 2026-11-09: Alert emails from Beszel through HTW's mail server
- First use of email in Ocean, to be reused by the planned inactive-database cleanup. Infra alerts came first because Beszel already has alerting and only needed a mail server, so the whole mail path could be proven before writing anything that deletes user data.
- No mail server of our own: Beszel sends straight to HTW's mail server (`mail1.rz.htw-berlin.de:25`, no login, STARTTLS) as `ocean@f4.htw-berlin.de`. HTW IT's suggestion was Postfix on the VM, but it would only queue mail in front of the same server. A smoke test from a container on ops showed HTW accepts it and it lands in the inbox, not spam; external providers were ruled out. Limitation: only HTW recipients.
- Alerts on all four VMs: down, disk > 85 % and RAM > 90 % for 10 min, CPU > 95 % for 60 min (catches a bad release, runaway query or miner). Beszel caps durations at 60 min because it keeps 1-minute samples for one hour only, so the wanted 3 h isn't possible.
- Configured once in Beszel's UI, documented as a three-step runbook in the operations guide. Beszel keeps mail settings, recipients and rules in its own database, which survives redeploys. A first version set them through Beszel's API from Ansible on every deploy. It worked, but took about 110 lines of API calls for three settings forms, needed the hub API published on the VM, and silently overwrote any change made in the UI. That is a lot for the next maintainer to understand and debug, for settings that only need redoing when ops is rebuilt.

## 2026-11-06: Dozzle agents only accept our own hub
- The Dozzle agents on app, pg and mongo used the certificate built into every Dozzle image, so anyone past the firewall could connect with a stock Dozzle and read logs, exec into containers or start and stop them. Hub and agents now share a cert pair of their own, and a stock hub is rejected (tested locally with the real images).
- Same pattern as the Beszel key: Ansible generates the pair on ops on the first deploy and copies it to the agents in the same run, so there is no new CI variable or manual step; if ops is rebuilt, the next deploy rolls out a fresh pair. A CI variable or Secure File was the alternative (survives an ops rebuild, but one more secret to paste).
- Dozzle's own `generate-certs` makes the pair because Dozzle checks specific certificate extensions; it is valid for five years and Ansible renews it 30 days before expiry. The hub reconnects to agents that come back with the new pair on its own, so only the side whose files changed is restarted.

## 2026-11-06: One setup script for fresh VMs
- The laptop part of provisioning (deploy key, `ansible` user on four VMs, runner on ops, CI secrets) was about a dozen hand-typed commands spread over four doc steps; mixing up keys there already broke a deploy once. It is now one re-runnable script, `deployment/setup.sh`, that skips whatever is already done.
- Ansible for the ops bootstrap runs in a throwaway Alpine container with the same packages as CI, so the laptop only needs Docker and nothing drifts from CI. Kept bash with no GitLab API: the GitLab clicks (runner, variables, Secure Files) stay manual, and the script prints exactly what to enter.
- CI secret values are generated once into a gitignored file and reused on re-runs, since a fresh value on an existing deployment would break the database logins.
- It also catches the one silent inventory mistake: a wrong ops `ip` would only show up as missing logs.
- The VM bootstrap script is now `deployment/prepare-vm.sh`, since it only gives Ansible access.

## 2026-11-05: Monitoring exposed in the HTW network with a login
- Dozzle and Beszel are now reachable from the HTW network over HTTPS on the ops VM (`/logs`, `/resources`, plus a small link page) instead of only through an SSH tunnel, so the professor can use them too.
- Each tool uses its own login, with the same user and a password from one CI variable; Caddy only does TLS and routing. A single shared login in Caddy that passes the identity on as a trusted header was tried first and failed: Beszel's web app sends its own token in the `Authorization` header, which replaces the browser's Basic login, so every API call was rejected. Working around that meant a hand-rolled session cookie, so the built-in logins won: real sessions, no trusted headers. GitLab OAuth or LDAP were considered: neither tool supports LDAP, and OAuth needs a GitLab app per project; both tools support OIDC natively, so it stays a possible upgrade.
- Beszel needs no manual setup any more: Ansible generates the hub key on ops and hands its public half to the agents in the same deploy, lists the systems in Beszel's `config.yml`, and the user comes from env vars on a fresh data dir (so a password change also needs a change in Beszel). It stays in SSH mode; WebSocket would remove the agent port but add a token secret and tie metrics to Caddy.
- Dozzle now also shows the ops VM's own containers (Caddy, hubs, runner, CI jobs).
- Ocean's Administration page links to both (Logs, Resources); the ops hostname comes from the inventory through the frontend's runtime config, so the buttons are hidden in local dev.

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
