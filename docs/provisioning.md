# Provisioning new VMs

Spin up Ocean on a fresh set of VMs. You do this once; after it, every change
ships via [Deploy](deploy.md). For how the moving parts fit together, see
[Deployment architecture](../ops/README.md).

> **HTW note:** the VMs have no direct internet access. Outbound traffic goes
> through the HTW web proxy `http://webproxy.rz.htw-berlin.de:3128`. Ansible and
> the VMs are already configured for it.

## 1. Request the VMs and certificates

Ask HTW (F4) for the VMs. Ocean needs:

| VM      | Role                                   | TLS cert/key |
| ------- | -------------------------------------- | ------------ |
| app     | frontend + backend                     | yes          |
| pg      | managed PostgreSQL + Adminer           | yes          |
| mongo   | managed MongoDB                        | yes          |
| ops     | GitLab CI runner (optional, recommended) | no         |

Each VM gets an `*.f4.htw-berlin.de` hostname. Also request a **TLS certificate + key** for the app, pg, and mongo hostnames (each terminates TLS itself).

## 2. Point the inventory at your VMs

Edit `ops/ansible/inventory.yml`. Its header comment lists exactly what to
change: each VM's `ansible_host`, its `tls_cert_file` / `tls_key_file`, and —
once — `docker_registry_url` + `container_registry_image` (your GitLab registry).

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

> Firewall automation is not in Ansible yet — this is the one manual step.

## 6. Set up GitLab (for CI deploys)

To deploy from the pipeline instead of your laptop, configure the project's
**Settings → CI/CD**:

- **Variables** — the five `OCEAN_*` secrets from step 3, plus
  `ANSIBLE_SSH_PRIVATE_KEY` (the private key matching the bootstrap public key).
- **Secure Files** — the TLS cert/key pairs from step 3.
- The image registry uses the built-in `CI_REGISTRY_*` credentials — nothing to add.

CI jobs run on the **ops runner** VM (jobs are tagged `ocean`). Bring it up once
from your laptop, then the pipeline can deploy the rest:

```sh
cd ops/ansible
GITLAB_RUNNER_TOKEN='<token>' ansible-playbook -i inventory.yml playbook.yml --limit ops
```

(The `deploy:ops` CI job exists too, but it's hidden behind a `DEPLOY_OPS=true`
pipeline variable to avoid touching the runner that's executing it.)

## 7. First deploy

Run the full deploy. From CI, run `deploy:app`, `deploy:pg`, and `deploy:mongo`.
From your laptop:

```sh
cd ops/ansible
ansible-galaxy install -r requirements.yml
set -a; . ../../.secrets/prod.env; set +a
export OCEAN_TLS_SRC="$(pwd)/../../.secrets/certs"
ansible -i inventory.yml all -m ping            # check connectivity
ansible-playbook -i inventory.yml playbook.yml  # all tiers
```

## Verify

- Open `https://<app-hostname>/` and log in.
- Create a PostgreSQL and a MongoDB database from the UI.
- The database ports should be reachable only from the app VM and the HTW network.

Next: [Operations](operations.md) — TLS renewal, secret rotation, redeploys.
