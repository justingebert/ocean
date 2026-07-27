# Operations

Useful maintenance tasks for a running Ocean deployment.

**GitLab is the source of truth.** Every secret is a CI/CD variable and every TLS
certificate/key is a Secure File. Persistent database data lives under
`/srv/ocean` on the VMs.

## Renew TLS certificates

Check the actual expiry dates in GitLab's Secure Files or in the live services;
newly requested certificates do not share the original deployment's expiry
date. Request reissue about 30 days before expiry. All three of app, pg and
mongo terminate TLS with their own certificate.

1. **Replace the Secure Files** — _Settings → CI/CD → Secure Files_. Upload the
   new cert/key keeping the **exact same filenames** as in `inventory.yml`
   (delete the old one first; the name is what the `tls` role looks up).
2. **Run the deploy job** for each VM whose cert changed: `deploy:app`,
   `deploy:pg`, `deploy:mongo`.
   Ansible detects changed TLS files and restarts the containers that consume
   them so the new certificate is loaded.
3. **Verify the live certificate**:

   ```sh
   openssl s_client -connect <app-host>:443   -servername <app-host> </dev/null 2>/dev/null \
     | openssl x509 -noout -dates
   openssl s_client -connect <pg-host>:5432   -starttls postgres </dev/null 2>/dev/null \
     | openssl x509 -noout -dates
   openssl s_client -connect <mongo-host>:27017 -servername <mongo-host> </dev/null 2>/dev/null \
     | openssl x509 -noout -dates
   ```

> Caddy, Postgres and mongod read their certificate at startup. The deployment
> therefore restarts their containers when Ansible copies changed TLS material.
> Always verify with `openssl s_client` above; don't assume a green pipeline means
> a live certificate.

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
out of every VM at once. The replacement CI/CD variable must remain **Type:
File**, **Visibility: Visible**, and **Protected** because an OpenSSH private key
is multiline and cannot satisfy GitLab's masked-value format.

## Persistent data and destructive commands

Normal Ansible redeploys and `docker compose down` preserve `/srv/ocean` because
production uses bind-mounted data directories. Deleting `/srv/ocean`, manually
removing its database directories, or replacing a VM without restoring that
data is destructive.

## Troubleshoot

On a VM, the stack runs as a Docker Compose project in `/etc/ocean`:

```sh
ssh ansible@<vm>.f4.htw-berlin.de
cd /etc/ocean
sudo docker compose ps            # container status
sudo docker compose logs -f       # follow all logs
sudo docker compose logs backend  # one service
```

| Symptom                          | Look at                                                        |
| -------------------------------- | -------------------------------------------------------------- |
| Job stays pending                | runner online; runner has the exact `ocean` tag                |
| Deploy says variable is missing  | pipeline runs on protected `main`; variable is Protected       |
| SSH private-key format error     | key is a Visible, Protected **File** variable with final newline |
| SSH permission denied            | matching public key is in `/home/ansible/.ssh/authorized_keys` |
| Secure File not found            | filename exactly matches `inventory.yml`, including case       |
| UI loads, login fails            | backend logs; is HTW LDAPS reachable from app VM?              |
| App cannot reach a database      | firewall; VM hostname in `inventory.yml`; HTW/VPN connectivity |
| Image will not pull              | images exist in this project's registry; Docker login logs     |
| TLS error in the browser/client  | full chain; matching key; SAN/FQDN; port; certificate dates    |

Restart a tier by re-running its deploy job, or on the VM:

```sh
sudo docker compose restart
```
