# ops/ — deployment (Infrastructure as Code)

Everything that defines a VM lives here and is version-controlled — there's no
manual server setup. For *which VM talks to which* (the runtime topology), see
the root README's [Architecture overview](../README.md#architecture-overview).

## Layout

| Path         | What it is                                              |
| ------------ | ------------------------------------------------------ |
| `ansible/`   | the engine — provisions every VM (roles below)         |
| `compose/`   | what actually runs — one Docker Compose stack per VM   |
| `bootstrap/` | one-shot: create the `ansible` login user on a fresh VM |
| `firewall/`  | reference iptables rules per VM (applied manually)     |

## The model

Each VM runs the Docker Compose stack in `compose/<vm>/` — those are the
containers actually serving traffic. The Ansible roles do the **setup around
it**: install Docker, render the env/config from the inventory + secrets, stage
the compose file, then `docker compose up`. Change a stack and it ships on the
next deploy.

## Roles

Ansible applies roles per VM group (wired in `ansible/playbook.yml`):

| Role            | Runs on        | What it does                                                                   |
| --------------- | -------------- | ----------------------------------------------------------------------------- |
| `base`          | all VMs        | Docker + compose, outbound proxy, the `ocean` user, `/etc/ocean` + `/srv/ocean` |
| `tls`           | app, pg, mongo | stage the TLS cert/key the VM terminates with                                 |
| `app`           | app VM         | render env + frontend config, start the app stack (frontend + backend + internal Postgres) |
| `pg`            | pg VM          | render env, start the managed-Postgres stack (+ Adminer behind Caddy)         |
| `mongo`         | mongo VM       | render env, start the managed-MongoDB stack                                   |
| `gitlab-runner` | ops VM         | install + register the GitLab CI runner                                       |

> `firewall/` is reference scripts only — opening ports is still manual (see
> [Provisioning](../docs/provisioning.md)).

## How a deploy flows

1. **GitLab CI** builds the `backend` and `frontend` images and pushes them to the registry.
2. From the **ops runner** VM, CI runs **Ansible** over SSH (or you run it from your laptop).
3. **Ansible** reads `inventory.yml` — the per-deployment values (hostnames, TLS filenames, registry) — and runs the roles above against each VM.
4. Each role renders that VM's config from the inventory + the `OCEAN_*` secrets, stages the compose files, and (re)starts the stack.

So a change ships as: **build images → run Ansible → re-render config and
restart the stack.** Nothing is configured by hand on the servers — to change a
VM, change the code here and re-run.

## Guides

- [docs/deploy.md](../docs/deploy.md) — ship a change to the running VMs
- [docs/provisioning.md](../docs/provisioning.md) — stand up Ocean on fresh VMs
- [docs/operations.md](../docs/operations.md) — TLS renewal, secret rotation, debug
