# deployment/ — Infrastructure as Code

Everything that defines a VM lives here and is version-controlled. There's no
manual server setup. For _which VM talks to which_ (the runtime topology), see
the root README's [Architecture overview](../README.md#architecture-overview).

## Layout

| Path         | What it is                                              |
| ------------ |---------------------------------------------------------|
| `ansible/`   | the engine: provisions every VM                         |
| `compose/`   | what actually runs on the VMs                           |
| `bootstrap/` | one-shot: create the `ansible` login user on a fresh VM |

## The model

Each VM runs the Docker Compose stack in `compose/<vm>/`, those are the
containers actually serving traffic. The Ansible roles do the **setup around
it**: install Docker, render the env/config from the inventory + secrets, stage
the compose file, then `docker compose up`. Change a stack and it ships on the
next deploy.

## Roles

Ansible applies roles per VM group (wired in `ansible/playbook.yml`):

| Role            | Runs on        | What it does                                                                               |
| --------------- | -------------- | ------------------------------------------------------------------------------------------ |
| `firewall`      | app, pg, mongo | apply the default-DROP iptables policy (runs **first**, before Docker)                     |
| `base`          | all VMs        | Docker + compose, outbound proxy, the `ocean` user, `/etc/ocean` + `/srv/ocean`            |
| `tls`           | app, pg, mongo | stage the TLS cert/key the VM terminates with                                              |
| `app`           | app VM         | render env + frontend config, start the app stack (frontend + backend + internal Postgres) |
| `pg`            | pg VM          | render env, start the managed-Postgres stack (+ Adminer behind Caddy)                      |
| `mongo`         | mongo VM       | render env, start the managed-MongoDB stack                                                |
| `gitlab-runner` | ops VM         | install + register the GitLab CI runner                                                    |

## Firewall

Each app/db VM runs a **default-DROP** iptables policy. The `firewall` role
renders it to `/root/firewall.sh` (overwriting the HTW original) and applies it
at the _start_ of the playbook.

Inbound ports are declared per VM group in `ansible/group_vars/`:

| VM    | Open inbound (`firewall_open_ports`) |
| ----- | ------------------------------------ |
| app   | 80, 443                              |
| pg    | 80, 443 (Adminer), 5432 (PostgreSQL) |
| mongo | 27017 (MongoDB)                      |

Sources are restricted to the HTW network — `141.45.0.0/16`, `10.4.0.0/16`
(`firewall_htw_sources` in `group_vars/all.yml`). The app VM additionally opens
outbound LDAPS and the Docker bridge (`firewall_allow_ldaps`,
`firewall_allow_docker_bridge`), which the default-DROP policy would otherwise
block.

To change what a VM exposes, edit its `group_vars` file and run with vm deploy job after commting.

## How a deploy flows

1. **GitLab CI** builds the `backend` and `frontend` images and pushes them to the registry.
2. From the **ops runner** VM, CI runs **Ansible** over SSH.
3. **Ansible** reads `inventory.yml`, the per-deployment values (hostnames, TLS filenames, registry) and runs against each VM.
4. Each role renders that VM's config from the inventory + the `OCEAN_*` secrets, stages the compose files, and (re)starts the stack.

So a change ships as: **build images → run Ansible → re-render config and
restart the stack.** Nothing is configured by hand on the servers, to change a
VM, change the code here and re-run.

## Guides

- [docs/deploy.md](../docs/deploy.md): ship a change to the running VMs
- [docs/provisioning.md](../docs/provisioning.md): spin up Ocean on fresh VMs
- [docs/operations.md](../docs/operations.md): TLS renewal, secret rotation, debug & rollback
