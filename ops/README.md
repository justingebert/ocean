# ops/

Deployment and VM-operation files for Ocean.

- `bootstrap/bootstrap-vm.sh` — one-shot script that creates the `ansible` user on a fresh VM.
- `ansible/` — playbook + roles that provision the three VMs (`app`, `pg`, `mongo`).
- `compose/` — docker-compose files and `.env.example` templates staged onto each VM by the playbook.

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

**pg-vm** — add a rule for Postgres `:5432`:

```sh
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

```

Each fullchain is leaf + GEANT TLS RSA 1 + HARICA TLS RSA Root CA 2021. The HARICA roots are already in both the VMs' OS trust store and the backend JVM's `cacerts`, so **no CA file is shipped** — pgjdbc (`sslfactory=DefaultJavaSSLFactory`) and the Mongo driver verify the DB certs against the JVM trust store. Confirm trust if certs change CA:

```sh
# JVM trust used by the backend (the one that matters):
sudo docker run --rm --entrypoint keytool ocean-backend:latest -list -cacerts -storepass changeit 2>&1 | grep -ci harica
```

The ansible `tls` role copies cert+key to `/etc/ocean/tls/` on each VM (cert.pem 0644, key.pem 0600 owned by the right service UID, combined.pem on mongo). Filenames mapped per-host in `ansible/inventory.yml` (`tls_cert_file`, `tls_key_file`).

> **Renewal:** HTW certs expire **2026-11-30**. Request reissue ~30 days before, drop the new files into `ops/certs/` with the same names, re-run `ansible-playbook -i inventory.yml playbook.yml --tags tls`.

> **Rollout state:** TLS is **enforced** on both managed clusters — pg via `hostssl`-only lines in `ops/compose/pg/pg_hba.conf`, mongo via `--tlsMode=requireTLS`. The backend must therefore connect with TLS: set `PG_CLUSTER_SSLMODE=verify-full` and `MONGODB_CLUSTER_TLS=true` in `backend.env` (see `backend.env.example`). Plain connections are rejected, so deploy the DB tiers and the backend env together. The internal `postgres_orm` and LDAP on app-vm stay plain — they talk to the backend over the host-local docker bridge and never cross the network.

> **Firewall:** open `:443` on app-vm before re-deploying. See "Open the firewall" above.

## Deploy with Ansible

From `ops/ansible/`:

```sh
ansible-galaxy install -r requirements.yml          # first time only
ansible -i inventory.yml all -m ping                # connectivity check
ansible-playbook -i inventory.yml playbook.yml      # full deploy

# Target a single tier
ansible-playbook -i inventory.yml playbook.yml --limit app
```
