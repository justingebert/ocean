# Provisioning new VMs

Stand up Ocean on a fresh set of VMs. You do this once; after it, every change
ships via [Deploy](deploy.md). For how the moving parts fit together, see
[Deployment architecture](../ops/README.md).

## Bootstrap order (read this first)

CI does the heavy lifting (it builds the images and deploys the app), but
**nothing in CI runs until the GitLab runner exists, and the runner runs on the
ops VM.** On top of that, the app VM has no image to run until CI has built one.
So the chain is strict and one-directional:

```
  local bootstrap                 CI (on the ops runner)
  ┌──────────────────┐      ┌───────────────┐
  │ pg, mongo,       │ ───▶ │ build images  │ ───▶  deploy:app
  │ ops (the runner) │      └───────────────┘
  └──────────────────┘
     runner            →        images        →        app
```

1. **Bootstrap locally** (your laptop): bring up the data tiers (`pg`, `mongo`)
   and register the runner on `ops`. These use public images, so no registry is
   needed yet.
2. **CI builds the images**: push to `main`; the build stage pushes
   `backend` + `frontend` to the registry.
3. **CI deploys the app**: `deploy:app` pulls those images.

The app VM is never deployed from your laptop: there is nothing to run until CI
has built an image. Everything you do locally is just enough to make CI work.

> **HTW note:** the VMs have no direct internet access. Outbound traffic goes
> through the HTW web proxy `http://webproxy.rz.htw-berlin.de:3128`. Ansible and
> the VMs are already configured for it.

## Prerequisites

- **Four VMs**: `app`, `pg`, `mongo`, `ops` (see step 1).
- A **GitLab project** with the **Container Registry** enabled and **CI/CD**
  turned on. HTW GitLab has no shared runners, so you run your own on the `ops`
  VM, which the local bootstrap registers.
- On your laptop: `ssh`, `ansible`, the `OCEAN_*` secrets and TLS files (step 3),
  and a **runner registration token** (GitLab → *Settings → CI/CD → Runners →
  New project runner*).

## 1. Request the VMs and certificates

Ask HTW (F4) for the VMs. Ocean needs:

| VM      | Role                                   | TLS cert/key |
| ------- | -------------------------------------- | ------------ |
| app     | frontend + backend                     | yes          |
| pg      | managed PostgreSQL + Adminer           | yes          |
| mongo   | managed MongoDB                        | yes          |
| ops     | GitLab CI runner                       | no           |

Each VM gets an `*.f4.htw-berlin.de` hostname. Also request a **TLS certificate + key** for the app, pg, and mongo hostnames (each terminates TLS itself).

## 2. Point the inventory at your VMs

Edit `ops/ansible/inventory.yml`. Its header comment lists exactly what to
change: each VM's `ansible_host`, its `tls_cert_file` / `tls_key_file`, and,
once, `docker_registry_url` + `container_registry_image` (your GitLab registry).

## 3. Create the secrets and stage the TLS files

From the repo root:

```sh
umask 077
mkdir -p .secrets/certs
{
  printf 'OCEAN_APPLICATION_SECRET=%s\n'       "$(openssl rand -hex 32)"
  printf 'OCEAN_JWT_SECRET=%s\n'               "$(openssl rand -hex 32)"
  printf 'OCEAN_POSTGRES_ORM_PASSWORD=%s\n'    "$(openssl rand -hex 32)"
  printf 'OCEAN_PG_CLUSTER_PASSWORD=%s\n'      "$(openssl rand -hex 32)"
  printf 'OCEAN_MONGODB_CLUSTER_PASSWORD=%s\n' "$(openssl rand -hex 32)"
} > .secrets/prod.env
```

Put each VM's cert + key in `.secrets/certs/`, named exactly as in
`inventory.yml`, e.g.:

```text
ocean-jg.pem     ocean-jg.f4.htw-berlin.de.key       # app
ocean-pg.pem     ocean-pg.f4.htw-berlin.de.key       # pg
ocean-mongo.pem  ocean-mongo.f4.htw-berlin.de.key    # mongo
```

## 4. Bootstrap each VM

Ansible logs in as the `ansible` user. Create it on each fresh VM:

```sh
# copy the bootstrap script to the VM
scp ops/bootstrap/bootstrap-vm.sh <you>@<vm>.f4.htw-berlin.de:/tmp/

# on the VM, as root, pass your laptop's SSH public key
ssh <you>@<vm>.f4.htw-berlin.de
su -
bash /tmp/bootstrap-vm.sh "ssh-ed25519 AAAA... your-key"
```

Verify from your laptop:

```sh
ssh ansible@<vm>.f4.htw-berlin.de sudo whoami   # -> root
```

> Use the **same** SSH key for all four VMs. CI later reuses its private half
> (`ANSIBLE_SSH_PRIVATE_KEY`, step 7) to deploy, so this one key authorises both
> your laptop and the runner.

## 5. Open the firewall (once per VM)

The HTW base image ships `/root/firewall.sh` (default-DROP) with the app/db ports
commented out. Open the ports each VM needs. Reference scripts with the final
rules per role live in [`../ops/firewall/`](../ops/firewall/).

```sh
ssh ansible@<vm>.f4.htw-berlin.de
sudo -e /root/firewall.sh    # edit: uncomment the lines for this VM
sudo /root/firewall.sh       # apply + persist (writes /etc/firewall.conf)
sudo iptables -L INPUT -n    # verify
```

| VM    | Open inbound                     |
| ----- | -------------------------------- |
| app   | 80, 443                          |
| pg    | 443 (Adminer), 5432 (PostgreSQL) |
| mongo | 27017 (MongoDB)                  |

Restrict the source to the HTW network (`141.45.0.0/16`, `10.4.0.0/16`) unless
the app must be reachable from the public internet.

> Firewall automation is not in Ansible yet. This is the one manual step.

## 6. Bootstrap locally: data tiers + runner

Run Ansible from your laptop against `pg`, `mongo`, and `ops`. This brings up the
managed databases and installs + registers the GitLab runner. `app` is left out
on purpose: its image does not exist yet (step 8).

The run reads these from the environment:

| Env var                         | What it is                                          | Used by |
| ------------------------------- | --------------------------------------------------- | ------- |
| `OCEAN_PG_CLUSTER_PASSWORD`     | managed-Postgres superuser password (from step 3)   | pg      |
| `OCEAN_MONGODB_CLUSTER_PASSWORD`| managed-Mongo root password (from step 3)           | mongo   |
| `OCEAN_TLS_SRC`                 | path to the dir holding the cert/key files (step 3) | pg, mongo |
| `GITLAB_RUNNER_TOKEN`           | runner registration token (Prerequisites)           | ops     |

Sourcing the whole `prod.env` is fine. The other `OCEAN_*` values are simply
unused here.

```sh
cd ops/ansible
ansible-galaxy install -r requirements.yml

set -a; . ../../.secrets/prod.env; set +a              # OCEAN_* secrets
export OCEAN_TLS_SRC="$(pwd)/../../.secrets/certs"      # TLS cert/key dir
export GITLAB_RUNNER_TOKEN='<token from GitLab>'        # registers the runner

ansible -i inventory.yml pg:mongo:ops -m ping           # check connectivity
ansible-playbook -i inventory.yml playbook.yml --limit pg:mongo:ops
```

The runner only needs registering once. After this, `ops` is normally left
alone: you don't want a deploy restarting the runner that is executing it.

## 7. Enable CI

So the runner can build images and deploy, configure the project's
**Settings → CI/CD**:

| Setting                                  | Value                                                          |
| ---------------------------------------- | ------------------------------------------------------------- |
| **Variable**, the five `OCEAN_*`         | the secrets from step 3                                        |
| **Variable** `ANSIBLE_SSH_PRIVATE_KEY`   | the private key matching the bootstrap public key (step 4)     |
| **Secure Files**                         | the TLS cert/key pairs from step 3                             |
| Image registry                           | built-in `CI_REGISTRY_*`, nothing to add                       |

CI jobs run on the `ops` runner (jobs are tagged `ocean`).

## 8. Build and deploy via CI

Push to `main`. CI builds the `backend` + `frontend` images and pushes them to
the registry, then exposes the manual deploy jobs:

- **`deploy:app`**: stands the app VM up from scratch (base + TLS + the stack)
  and pulls the freshly built images.
- `deploy:pg` / `deploy:mongo`: only when you later change their config or the
  inventory; the data tiers are already running from step 6.

From here on, every change ships this way. See [Deploy](deploy.md).

## Verify

- Open `https://<app-hostname>/` and log in.
- Create a PostgreSQL and a MongoDB database from the UI.
- The database ports should be reachable only from the app VM and the HTW network.

Next: [Operations](operations.md) for TLS renewal, secret rotation, redeploys.
