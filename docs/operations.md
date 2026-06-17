# Operations

Day-2 tasks for a running Ocean deployment.

## Renew TLS certificates

HTW certificates expire **2026-11-30**. Request reissue ~30 days before.

1. Replace the cert/key files in `.secrets/certs/` (or the GitLab Secure Files),
   keeping the **same filenames** as in `inventory.yml`.
2. Re-stage them:

   ```sh
   cd ops/ansible
   export OCEAN_TLS_SRC="$(pwd)/../../.secrets/certs"
   ansible-playbook -i inventory.yml playbook.yml --tags tls
   ```

3. Make sure `:443` is open on the app VM (see the firewall step in
   [Provisioning](provisioning.md#5-open-the-firewall-once-per-vm)).

The backend image bundles the HTW LDAP CA separately; renewing the server
certificates does not affect it.

## Rotate a secret

1. Change the value in `.secrets/prod.env` (or the GitLab CI/CD variable).
2. Re-run the relevant tier:

   ```sh
   set -a; . ../../.secrets/prod.env; set +a
   ansible-playbook -i inventory.yml playbook.yml --limit app   # or pg / mongo
   ```

> **Careful:** changing a database password in the env file does **not** change
> the password already stored inside an existing Postgres/Mongo data volume. To
> rotate a DB password on a VM that already holds data, change it inside the
> database first (or reset the data volume), then update the env value.

## Troubleshoot

On a VM, the stack runs as a Docker Compose project in `/etc/ocean`:

```sh
ssh ansible@<vm>.f4.htw-berlin.de
cd /etc/ocean
sudo docker compose ps            # container status
sudo docker compose logs -f       # follow all logs
sudo docker compose logs backend  # one service
```

| Symptom                    | Look at                                           |
| -------------------------- | ------------------------------------------------- |
| UI loads, login fails      | backend logs; is HTW LDAPS reachable from app-vm? |
| App can't reach a database | firewall on pg/mongo VM; hostname in `inventory.yml` |
| Image won't pull           | registry login; `container_registry_image` value  |
| TLS error in the browser   | cert files staged; `:443` open; cert not expired  |

Restart a tier by re-running its deploy, or on the VM:

```sh
sudo docker compose restart
```
