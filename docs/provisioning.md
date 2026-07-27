# Provision Ocean on fresh VMs

This is a guide for copying Ocean into a new project on the HTW GitLab (https://gl-ai.f4.htw-berlin.de/) and deploying it to four newly requested VMs. 
Start with an empty GitLab project and fresh VMs; after the initial setup, deployments happen through CI only.

For how the moving parts fit together, see[Deployment architecture](../deployment/README.md).

## What is manual and what is automated

Two bootstrapping actions must happen from a laptop:

1. create the `ansible` account on all four VMs; and
2. install and register the first GitLab runner on the `ops` VM.

The runner then builds the application images. The three manual deploy jobs
provision the database VMs and app VM through Ansible.

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

## Prerequisites and assumptions

- Four HTW F4 VMs: `app`, `pg`, `mongo`, and `ops`.
- A laptop with `git`, `ssh`, `openssl`, and Ansible installed.
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

In the new project, protect `main` under **Settings → Repository → Branch
rules**. This matters because protected CI/CD variables are not exposed to a
pipeline on an unprotected branch.

The pipeline can initially remain pending because no runner exists yet.

## 2. Request VMs and TLS certificates

Request the following from HTW F4:

| VM      | Services                                      | TLS certificate/key |
| ------- | --------------------------------------------- | ------------------- |
| `app`   | frontend, backend, internal PostgreSQL        | yes                 |
| `pg`    | managed PostgreSQL and Adminer                | yes                 |
| `mongo` | managed MongoDB                               | yes                 |
| `ops`   | project-specific GitLab runner                | no                  |

## 3. Configure the Ansible inventory

Edit [`deployment/ansible/inventory.yml`](../deployment/ansible/inventory.yml):

- replace all four `ansible_host` values with the new VM FQDNs; and
- replace `tls_cert_file` and `tls_key_file` for `app`, `pg`, and `mongo` with
  the exact filenames received from HTW.

Do not put a GitLab namespace into the inventory. In CI, `CI_REGISTRY` and
`CI_REGISTRY_IMAGE` automatically select the Container Registry belonging to
the new project.

Commit and push the inventory change to `main` before deploying.

## 4. Create a dedicated deployment SSH key

Create a new, project-specific key. It must have no passphrase because the CI
job has no interactive agent with which to unlock it:

```sh
ssh-keygen -t ed25519 -N '' -C 'ocean-ansible' -f ~/.ssh/ocean_ansible
chmod 600 ~/.ssh/ocean_ansible
```

On each of the four VMs, copy and run the bootstrap script using the initial
user account supplied by HTW:

```sh
scp deployment/bootstrap/bootstrap-vm.sh <user>@<vm-fqdn>:/tmp/
ssh <user>@<vm-fqdn>
su -
bash /tmp/bootstrap-vm.sh 'ssh-ed25519 AAAA... ocean-ansible'
```

Replace the last argument with the complete single line printed by
`cat ~/.ssh/ocean_ansible.pub` on the laptop. Only the `.pub` content belongs on
the VMs; the private `ocean_ansible` file stays on the laptop and in GitLab's
protected file variable.

Run this verification from the laptop for **all four** hostnames:

```sh
ssh -i ~/.ssh/ocean_ansible ansible@<vm-fqdn> sudo whoami
# expected output: root
```

## 5. Create and register the project runner

In the new GitLab project, open **Settings → CI/CD → Runners → Create project
runner**:

- choose Linux;
- add the tag `ocean` (every job in `.gitlab-ci.yml` requires it);
- keep the runner assigned only to this project; and
- copy the short-lived runner authentication token shown after creation.

GitLab routes tagged jobs only to runners with all required tags; see GitLab's
[project runner documentation](https://docs.gitlab.com/ci/runners/runners_scope/#create-a-project-runner-with-a-runner-authentication-token).

From the repository on the laptop, install the Ansible collection and provision
only the `ops` VM. Explicitly select the dedicated key:

```sh
cd deployment/ansible
ansible-galaxy collection install -r requirements.yml
export GITLAB_RUNNER_TOKEN='<token shown by GitLab>'

ansible -i inventory.yml ops -m ping --private-key ~/.ssh/ocean_ansible
ansible-playbook -i inventory.yml playbook.yml \
  --limit ops \
  --private-key ~/.ssh/ocean_ansible
unset GITLAB_RUNNER_TOKEN
```

Return to the Runners page and wait until the runner is **online**. If jobs stay
pending, first check that the runner has the exact `ocean` tag.

## 6. Add CI/CD variables

Open **Settings → CI/CD → Variables**. Generate a separate value for each of the
five application/database variables:

```sh
openssl rand -hex 32
```

Create these variables with environment scope `*`, variable expansion off, and
**Protect variable** enabled:

| Key                                | Type       | Visibility | Value                         |
| ---------------------------------- | ---------- | ---------- | ----------------------------- |
| `OCEAN_APPLICATION_SECRET`         | Variable   | Masked     | unique 32-byte hex            |
| `OCEAN_JWT_SECRET`                 | Variable   | Masked     | unique 32-byte hex            |
| `OCEAN_POSTGRES_ORM_PASSWORD`      | Variable   | Masked     | unique 32-byte hex            |
| `OCEAN_PG_CLUSTER_PASSWORD`        | Variable   | Masked     | unique 32-byte hex            |
| `OCEAN_MONGODB_CLUSTER_PASSWORD`   | Variable   | Masked     | unique 32-byte hex            |
| `ANSIBLE_SSH_PRIVATE_KEY`          | **File**   | **Visible** | complete `ocean_ansible` file |

Important SSH-key pitfall: paste the complete multiline private key, including
the `BEGIN`/`END OPENSSH PRIVATE KEY` lines and final newline. GitLab's masked
value rules require a single line, so a multiline OpenSSH key cannot be Masked.
Select **Type: File** and **Visibility: Visible** explicitly; newer GitLab
versions default to Masked. The pipeline treats the variable value as a file
path. Keep it Protected, restrict Maintainer access, and never print it in a
job. GitLab docu: [file type CI/CD variables](https://docs.gitlab.com/ci/variables/#use-file-type-cicd-variables).

## 7. Upload TLS Secure Files

Under **Settings → CI/CD → Secure Files**, upload the three certificate/key
pairs: six files in total. Their names must match `tls_cert_file` and
`tls_key_file` in `inventory.yml` character for character, including case and
extensions.

Secure Files are project-specific and are not copied with the Git repository.
Do not add `OCEAN_TLS_SRC`; the deploy job downloads Secure Files and sets that
path itself.

## 8. Build and perform the first deployment

Run a pipeline for the latest commit on protected `main`, or push the completed
inventory commit. Confirm that both build jobs succeed and that images appear
under **Deploy → Container Registry**.

From that same successful pipeline, start the manual jobs in this order:

1. `deploy:pg`
2. `deploy:mongo`
3. `deploy:app`

The database tiers use public images. The app job pulls the backend and frontend
images tagged with that pipeline's commit SHA from the **new project's**
registry. 

Do not start `deploy:ops` during normal setup. It is intentionally hidden unless
the pipeline variable `DEPLOY_OPS=true` is supplied, and the first runner setup
has already been completed from the laptop.

## 9. Acceptance checklist

- [ ] All CI validation and build jobs are green; no job is pending for a runner.
- [ ] `deploy:pg`, `deploy:mongo`, and `deploy:app` succeed.
- [ ] `https://<app-fqdn>/` presents the expected certificate and accepts an HTW
  login.

For maintenance continue with [Operations](operations.md).
