# Operations

Useful maintenance tasks for a running Ocean deployment.

**GitLab is the source of truth.** Every secret is a CI/CD variable and every TLS
cert/key is a Secure File

## Renew TLS certificates

HTW certificates expire **2026-11-30**. Request reissue ~30 days before. All
three of app, pg and mongo terminate TLS with their own certificate.

1. **Replace the Secure Files** — _Settings → CI/CD → Secure Files_. Upload the
   new cert/key keeping the **exact same filenames** as in `inventory.yml`
   (delete the old one first; the name is what the `tls` role looks up).
2. **Run the deploy job** for each VM whose cert changed: `deploy:app`,
   `deploy:pg`, `deploy:mongo`.
3. **Restart the pg and mongo stacks**, then verify:

   ```sh
   openssl s_client -connect <app-host>:443   -servername <app-host> </dev/null 2>/dev/null \
     | openssl x509 -noout -dates
   openssl s_client -connect <pg-host>:5432   -starttls postgres </dev/null 2>/dev/null \
     | openssl x509 -noout -dates
   openssl s_client -connect <mongo-host>:27017 </dev/null 2>/dev/null \
     | openssl x509 -noout -dates
   ```

> **A deploy stages the new cert but does not always activate it.** The cert is
> bind-mounted from `/etc/ocean/tls` into Caddy / Postgres / mongod, and none of
> them watch the file, they read it at startup. On the **app** VM every deploy
> ships a new image tag, so the frontend container is recreated and picks the
> cert up. On **pg** and **mongo** nothing in the stack changed, so the
> containers are _not_ recreated and keep serving the **old** certificate until
> you restart them:
>
> ```sh
> ssh ansible@<pg-or-mongo-host>.f4.htw-berlin.de
> cd /etc/ocean && sudo docker compose restart
> ```
>
> Always verify with `openssl s_client` above, don't assume a green pipeline
> means a live certificate.

## Rotate a secret

1. Change the value in _Settings → CI/CD → Variables_.
2. Run the deploy job for each tier that uses it:

   | Variable                         | Re-run                              |
   | -------------------------------- | ----------------------------------- |
   | `OCEAN_APPLICATION_SECRET`       | `deploy:app`                        |
   | `OCEAN_JWT_SECRET`               | `deploy:app`                        |
   | `OCEAN_POSTGRES_ORM_PASSWORD`    | `deploy:app`                        |
   | `OCEAN_PG_CLUSTER_PASSWORD`      | `deploy:app` **and** `deploy:pg`    |
   | `OCEAN_MONGODB_CLUSTER_PASSWORD` | `deploy:app` **and** `deploy:mongo` |


> **Careful:** changing a database password in a variable does **not** change the
> password already stored inside an existing Postgres/Mongo data volume. To
> rotate a DB password on a VM that already holds data, change it inside the
> database first (or reset the data volume), then update the variable and
> redeploy.

Rotating `ANSIBLE_SSH_PRIVATE_KEY` is different, it's the key CI uses to reach
the VMs, so the new **public** half has to be in each VM's
`~ansible/.ssh/authorized_keys` _before_ you swap the variable, or you lock CI
out of every VM at once.

## Troubleshoot

On a VM, the stack runs as a Docker Compose project in `/etc/ocean`:

```sh
ssh ansible@<vm>.f4.htw-berlin.de
cd /etc/ocean
sudo docker compose ps            # container status
sudo docker compose logs -f       # follow all logs
sudo docker compose logs backend  # one service
```

| Symptom                    | Look at                                              |
| -------------------------- | ---------------------------------------------------- |
| UI loads, login fails      | backend logs; is HTW LDAPS reachable from app-vm?    |
| App can't reach a database | firewall on pg/mongo VM; hostname in `inventory.yml` |
| Image won't pull           | registry login; `container_registry_image` value     |
| TLS error in the browser   | cert files staged; `:443` open; cert not expired     |

Restart a tier by re-running its deploy job, or on the VM:

```sh
sudo docker compose restart
```