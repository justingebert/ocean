# Provisioning new VMs

Spin up Ocean on a fresh set of VMs. You do this once; after it, every change
ships via [Deploy](deploy.md). For how the moving parts fit together, see
[Deployment architecture](../deployment/README.md).

## Bootstrap order (read this first)

Almost everything here is done by CI. Exactly **two** things have to be done by
hand, for one reason each:

- **Ansible can't log in until the `ansible` user exists.** Creating it needs
  root SSH on a fresh VM, so it can't be automated from inside the system it's
  bootstrapping.
- **The runner can't register itself.** CI jobs need a runner, and the runner
  lives on the `ops` VM, so the first Ansible run has to come from your laptop.

After those two, the laptop is out of the loop: CI builds the images and
provisions every VM.

```
  Manual, once (laptop)              GitLab                    CI (on the ops runner)
  ┌──────────────────────┐      ┌──────────────┐      ┌──────────────┐
  │ 1. create `ansible`  │      │ 3. secrets + │      │ 4. build     │ ─▶ deploy:pg
  │    user on 4 VMs     │ ───▶ │    TLS files │ ───▶ │    images    │ ─▶ deploy:mongo
  │ 2. register runner   │      └──────────────┘      └──────────────┘ ─▶ deploy:app
  │    on ops            │
  └──────────────────────┘
   SSH key + runner token        5 vars + 3 cert pairs        everything else
```

> **HTW note:** the VMs have no direct internet access. Outbound traffic goes
> through the HTW web proxy `http://webproxy.rz.htw-berlin.de:3128`. Ansible and
> the VMs are already configured for it.

## Prerequisites

- **Four VMs**: `app`, `pg`, `mongo`, `ops` (see step 1).
- A **GitLab project** with the **Container Registry** enabled and **CI/CD**
  turned on. HTW GitLab has no shared runners, so you run your own on the `ops`
  VM, which step 4 registers.
- On your laptop: `ssh`, `ansible`, and a **runner registration token**
  (GitLab → _Settings → CI/CD → Runners → New project runner_).

> https://gitlab.rz.htw-berlin.de/ does not have the Container Registry enabled. That's why we recommend using the https://gl-ai.f4.htw-berlin.de/

## 1. Request the VMs and certificates

Ask HTW (F4) for the VMs. Ocean needs:

| VM    | Role                         | TLS cert/key |
| ----- | ---------------------------- | ------------ |
| app   | frontend + backend           | yes          |
| pg    | managed PostgreSQL + Adminer | yes          |
| mongo | managed MongoDB              | yes          |
| ops   | GitLab CI runner             | no           |

Each VM gets an `*.f4.htw-berlin.de` hostname. Also request a **TLS certificate + key** for the app, pg, and mongo hostnames (each terminates TLS itself).

## 2. Point the inventory at your VMs

Edit `deployment/ansible/inventory.yml` and commit it: CI reads this file, so
it has to be in the repo before anything else works. Three things to change:

| What                                               | Where                       |
| -------------------------------------------------- | --------------------------- |
| each VM's `ansible_host`                           | per host, under `children:` |
| each VM's `tls_cert_file` / `tls_key_file`         | per host (app, pg, mongo)   |
| `docker_registry_url` + `container_registry_image` | once, under `all.vars`      |

The cert/key filenames must match exactly what you upload in step 5.

## 3. Create the `ansible` user on every VM

Ansible logs in as the `ansible` user. Create it on each of the four fresh VMs:

```sh
# copy the bootstrap script to the VM
scp deployment/bootstrap/bootstrap-vm.sh <you>@<vm>.f4.htw-berlin.de:/tmp/

# on the VM, as root, pass your laptop's SSH public key
ssh <you>@<vm>.f4.htw-berlin.de
su -
bash /tmp/bootstrap-vm.sh "ssh-ed25519 AAAA... your-key"
```

Verify from your laptop:

```sh
ssh ansible@<vm>.f4.htw-berlin.de sudo whoami   # -> root
```

> Use the **same** SSH key for all four VMs. CI reuses its private half
> (`ANSIBLE_SSH_PRIVATE_KEY`, step 5) to deploy, so this one key authorises both
> your laptop and the runner.

## 4. Register the GitLab runner on `ops`

The only Ansible run you do by hand. It needs **just the runner token**.
Get the token from GitLab: → _Settings → CI/CD → Runners → New project runner_.

```sh
cd deployment/ansible
ansible-galaxy install -r requirements.yml

export GITLAB_RUNNER_TOKEN='<token from GitLab>'

ansible -i inventory.yml ops -m ping                        # check connectivity
ansible-playbook -i inventory.yml playbook.yml --limit ops
```

The runner only needs registering once. After this, `ops` is normally left
alone: you don't want a deploy restarting the runner that is executing it.

## 5. Load the secrets into GitLab

GitLab is the source of truth for every secret. Generate the five values and
paste them straight into **Settings → CI/CD → Variables**, don't write them to
a file:

```sh
openssl rand -hex 32    # run once per variable
```

| Setting                                       | Value                                               |
| --------------------------------------------- |-----------------------------------------------------|
| **Variable** `OCEAN_APPLICATION_SECRET`       | random 32-byte hex                                  |
| **Variable** `OCEAN_JWT_SECRET`               | random 32-byte hex                                  |
| **Variable** `OCEAN_POSTGRES_ORM_PASSWORD`    | random 32-byte hex                                  |
| **Variable** `OCEAN_PG_CLUSTER_PASSWORD`      | random 32-byte hex: managed-Postgres superuser      |
| **Variable** `OCEAN_MONGODB_CLUSTER_PASSWORD` | random 32-byte hex: managed-Mongo root              |
| **Variable** `ANSIBLE_SSH_PRIVATE_KEY`        | the private key matching the public key from step 3 |
| **Secure Files**                              | the three TLS cert/key pairs from step 1            |

`ANSIBLE_SSH_PRIVATE_KEY` which needs type `File` and set visible because of formatting issues with Gitlab.
Mark every other variable **Masked** and **Protected**. 
Upload the TLS files under _Settings → CI/CD → Secure Files_, named exactly as in `inventory.yml`.

## 6. Build and deploy via CI

Push to `main`. CI builds the `backend` + `frontend` images and pushes them to
the registry, then exposes the manual deploy jobs. Run all three

| Job            | Brings up                                                          |
| -------------- | ------------------------------------------------------------------ |
| `deploy:pg`    | managed PostgreSQL + Adminer (public images only)                  |
| `deploy:mongo` | managed MongoDB (public images only)                               |
| `deploy:app`   | frontend + backend + internal Postgres, from the images just built |

From here on, every change ships this way. See [Deploy](deploy.md).

## Verify

- Open `https://<app-hostname>/` and log in.
- Create a PostgreSQL and a MongoDB database from the UI.
- The database ports should be reachable only from the app VM and the HTW network.

Next: [Operations](operations.md) for TLS renewal, secret rotation, redeploys & rollbacks.
