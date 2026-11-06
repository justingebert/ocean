# Provision Ocean on fresh VMs

This is a guide for copying Ocean into a new project on the HTW GitLab (https://gl-ai.f4.htw-berlin.de/) and deploying it to four newly requested VMs. 
Start with an empty GitLab project and fresh VMs; after the initial setup, deployments happen through CI only.

For how the moving parts fit together, see[Deployment architecture](../deployment/README.md).

## What is manual and what is automated

One script runs once from a laptop, [`deployment/setup.sh`](../deployment/setup.sh):
it creates the `ansible` account on all four VMs and installs and registers the
GitLab runner on `ops`. Everything after that runs from GitLab: the runner builds
the images, and the manual `deploy` job provisions all VMs through Ansible.

```
  Laptop, once                     GitLab                 Gitlab CI
  ┌──────────────────────┐      ┌──────────────┐      ┌──────────────┐
  │ ./deployment/setup.sh│ ───▶ │ variables +  │ ───▶ │ build images │ ─▶ deploy
  │ (ansible user, ops   │      │ Secure Files │      └──────────────┘
  │  runner)             │      └──────────────┘
  └──────────────────────┘
```

## Prerequisites and assumptions

- Four HTW F4 VMs: `app`, `pg`, `mongo`, and `ops`.
- A laptop (macOS, Linux or WSL) with `git`, `ssh`, `openssl` and Docker.
- Access to the HTW network, either on campus or through the HTW VPN. SSH and
  all application/database ports are restricted to HTW source networks.
- A new project on `https://gl-ai.f4.htw-berlin.de/`. Do not use
  `gitlab.rz.htw-berlin.de`: that instance does not provide the Container
  Registry required by this pipeline.
- Maintainer access to configure runners, CI/CD variables, Secure Files,
  protected branches, and the Container Registry.

## 1. Copy the repository to a new GitLab project

Create a **blank** project on `gl-ai.f4.htw-berlin.de` with no generated README.
Keep the default branch name `main` and make sure **Deploy → Container Registry**
is available. Then copy the repository.

The pipeline can initially remain pending because no runner exists yet.

## 2. Request VMs and TLS certificates

Request 4 Vms with TLS certificates from HTW F4:

| VM      | Services                                      |
| ------- | --------------------------------------------- |
| `app`   | frontend, backend, internal PostgreSQL        |
| `pg`    | managed PostgreSQL and Adminer                |
| `mongo` | managed MongoDB                               | 
| `ops`   | project-specific GitLab runner, monitoring    |

## 3. Point Ansible to the new VMs

Edit [`deployment/ansible/inventory.yml`](../deployment/ansible/inventory.yml):

- replace all four `ansible_host` values with the new VM FQDNs;
- set `ip` on `ops` to the ops VM's IPv4 address and
- replace `tls_cert_file` and `tls_key_file` on all four hosts with the exact
  filenames received from HTW.

Commit and push the inventory change to `main`.

## 4. Run the setup script

From the repository root on the laptop (HTW network or VPN):

```sh
./deployment/setup.sh
```

It is safe to re-run: every step skips what is already done. It

1. checks for Docker, ssh and openssl, and prints what the inventory says, so
   leftovers from old VMs stand out;
2. creates the deploy key `~/.ssh/ocean_ansible`.
3. gives Ansible access to each VM by running
   [`prepare-vm.sh`](../deployment/prepare-vm.sh) there. For each VM it asks
   for the local login user and, via `su -`, the root password;
4. checks that `ip` on ops matches the ops VM;
5. sets up firewall, Docker and the GitLab runner on ops. It asks for the
   runner token, see below; and
6. prints the CI/CD variables and Secure Files to enter in GitLab, see below.

Re-running it later re-applies firewall, Docker and runner on ops (see
[What deploys from where](deploy.md#what-deploys-from-where)); do that while no
CI job is running.

**Runner token.** In the new GitLab project, open **Settings → CI/CD → Runners →
Create project runner**: choose Linux, add the tag `ocean` (every job requires
it), keep it assigned to this project only, and paste the token shown after
creation into the script. Afterwards the runner should show as **online**.
See GitLab's [project runner documentation](https://docs.gitlab.com/ci/runners/runners_scope/#create-a-project-runner-with-a-runner-authentication-token).

**CI/CD variables.** Under **Settings → CI/CD → Variables**, create the printed
variables with **Protect variable** on and variable expansion off. The script
generates the values once into `.secrets/ci-variables.env` (gitignored) and
prints the same ones on every run. Once they are in GitLab you can delete the
file: GitLab is the source of truth. `OCEAN_OPS_PASSWORD` is the monitoring
login on ops (Dozzle and Beszel, user `mon@ocean.de`); maintainers look it up
in GitLab.

SSH-key pitfall: `ANSIBLE_SSH_PRIVATE_KEY` must be **Type: File** and
**Visibility: Visible** (newer GitLab defaults to Masked, and a multiline key
can't be masked). Paste the whole key file, including the `BEGIN`/`END` lines
and the final newline, and never print it in a job. GitLab docu:
[file type CI/CD variables](https://docs.gitlab.com/ci/variables/#use-file-type-cicd-variables).

**Secure Files.** Under **Settings → CI/CD → Secure Files**, upload the eight
printed certificate/key files. Their names must match `tls_cert_file` and
`tls_key_file` in `inventory.yml` exactly. 

## 5. Build and perform the first deployment

Run a pipeline for the latest commit on protected `main`, or push the completed
inventory commit. Confirm that both build jobs succeed and that images appear
under **Deploy → Container Registry**.

From that same successful pipeline, start the manual `deploy` job. It stages
the certificates, starts the monitoring stack on ops, sets up pg and mongo, then
app.

The database tiers use public images. The app VM pulls the backend and frontend
images tagged with that pipeline's commit SHA from the **new project's**
registry. 


## 6. Acceptance checklist

- [ ] All CI validation and build jobs are green; no job is pending for a runner.
- [ ] `deploy` succeeds.
- [ ] `https://<app-fqdn>/` accepts an HTW login.
- [ ] `https://<ops-fqdn>/` shows Logs and Resources; both accept `mon@ocean.de` + `OCEAN_OPS_PASSWORD` and show all four VMs.

For maintenance continue with [Operations](operations.md).
