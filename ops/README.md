# Deployment and VM-operation files for Ocean.

- `bootstrap/bootstrap-vm.sh` — one-shot script that creates the `ansible` user on a fresh VM.
- `ansible/` — playbook + roles that provision the three VMs (`app`, `pg`, `mongo`).
- `compose/` — docker-compose files used by the Ansible roles.

> **HTW network note:** the VMs have no direct internet access. All outbound HTTP(S) goes through the HTW web proxy at `http://webproxy.rz.htw-berlin.de:3128`. 

## Bootstrap a new VM (once per VM)

The playbook logs in as the `ansible` user. To create that user on a fresh VM:

1. Copy ssh pubkey
   ```sh
   cat ~/.ssh/id_ed25519.pub
   ```
2. Copy the bootstrap script to the VM:
   ```sh
   scp ops/bootstrap/bootstrap-vm.sh <user>@<vm>.f4.htw-berlin.de:/tmp/
   ```
3. SSH in, become root, run the script with the pubkey as argument:
   ```sh
   ssh <user>@<vm>.f4.htw-berlin.de
   su -
   bash /tmp/bootstrap-vm.sh "ssh-ed25519 AAAA... your-key"
   ```
4. Verify from the laptop:
   ```sh
   ssh ansible@<vm>.f4.htw-berlin.de sudo whoami   # → root
   ```

## Open the firewall (manual, once per VM)

The HTW base image ships with `/root/firewall.sh` — a default-DROP iptables script. Edit it as root, then re-run.

**app-vm** — uncomment HTTP/HTTPS inbound for the world (or restrict to the HTW network):

```sh
ssh ansible@<vm>.f4.htw-berlin.de
sudo -e /root/firewall.sh
```

Uncomment in the script:
```sh
# Welt
iptables -A INPUT -p tcp --dport 80  -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```
(or, for HTW-only access, uncomment the `141.45.0.0/16,10.4.0.0/16` variants instead.)

**pg-vm** — add rules for Adminer HTTPS and Postgres:

```sh
iptables -A INPUT -s 141.45.0.0/16,10.4.0.0/16 -p tcp --dport 443  -j ACCEPT
iptables -A INPUT -s 141.45.0.0/16,10.4.0.0/16 -p tcp --dport 5432 -j ACCEPT
```

**mongo-vm** — add a rule for Mongo `:27017`:

```sh
iptables -A INPUT -s 141.45.0.0/16,10.4.0.0/16 -p tcp --dport 27017 -j ACCEPT
```

Then on each VM:

```sh
sudo /root/firewall.sh        # applies + persists to /etc/firewall.conf
sudo iptables -L INPUT -n     # verify
```

The script writes `/etc/firewall.conf` and an `if-up.d` hook, so rules survive reboot.


## TLS certificates

- ansible sets up provided tls certs for all VMs

- backend docker image bakes in LDAP CA

The pg role also stages `backend/docker/dfn-community-root-ca-2022.pem` mounts it. This is separate from the backend JVM trust store; Postgres LDAP auth uses libldap/OpenSSL trust inside the Postgres container.

> **Renewal:** HTW certs expire **2026-11-30**. Request reissue ~30 days before, update the TLS secure files with the same names, re-run `ansible-playbook -i inventory.yml playbook.yml --tags tls`.

> **Firewall:** open `:443` on app-vm before re-deploying. See "Open the firewall" above.

## Deploy secrets

Ansible renders `/etc/ocean/*.env` from Jinja templates. Keep only scalar secret values in local env vars or GitLab CI/CD variables.

Create local deploy secrets from the repo root:

```sh
umask 077
mkdir -p .secrets/certs
{
  printf 'OCEAN_APPLICATION_SECRET=%s\n' "$(openssl rand -hex 32)"
  printf 'OCEAN_JWT_SECRET=%s\n' "$(openssl rand -hex 32)"
  printf 'OCEAN_POSTGRES_ORM_PASSWORD=%s\n' "$(openssl rand -hex 32)"
  printf 'OCEAN_PG_CLUSTER_PASSWORD=%s\n' "$(openssl rand -hex 32)"
  printf 'OCEAN_MONGODB_CLUSTER_PASSWORD=%s\n' "$(openssl rand -hex 32)"
} > .secrets/prod.env
```

Put TLS cert/key files in `.secrets/certs/` locally, or as GitLab secure files in CI:

```text
ocean-jg.pem
ocean-jg.f4.htw-berlin.de.key
ocean-pg.pem
ocean-pg.f4.htw-berlin.de.key
ocean-mongo.pem
ocean-mongo.f4.htw-berlin.de.key
```

In GitLab, add the five `OCEAN_*` secret values as CI/CD variables. Add only TLS cert/key files as secure files.

Changing DB env files does not rotate passwords inside existing Postgres/Mongo data volumes. For an existing VM, rotate the DB passwords first or reset the data volume before switching to new DB credentials.

## Deploy with Ansible

From the repo root:

```sh
cd ops/ansible
ansible-galaxy install -r requirements.yml
ansible -i inventory.yml all -m ping
```

Deploy the ops runner VM from the repo root:

```sh
cd ops/ansible
GITLAB_RUNNER_TOKEN='<token>' ansible-playbook -i inventory.yml playbook.yml --limit ops
```

Deploy app/db VMs from the repo root:

```sh
set -a
. ./.secrets/prod.env
set +a
export OCEAN_TLS_SRC="$(pwd)/.secrets/certs"

cd ops/ansible
ansible-playbook -i inventory.yml playbook.yml      # full deploy

# Target a single tier
ansible-playbook -i inventory.yml playbook.yml --limit app    #TODO this also needs gitlab registryh username and TOKEN
```
