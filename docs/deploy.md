# Deploy Guide

Ocean's services run on three HTW VMs: **app**, **pg**, and **mongo**. A fourth
**ops** VM hosts the GitLab runner and the monitoring (Dozzle, Beszel). The VMs are provisioned once and then
updated from GitLab CI; this page explains how to deploy changes to production.

> Want a fresh deployment on your own VMs? [Provisioning new VMs](provisioning.md) covers setup with new VMs from
> scratch.
>
> New to the setup? [Deployment architecture](../deployment/README.md) explains the Infrastructure-as-Code in a page.

## Deploy a change to production

Changes are checked by CI/CD and then deployed by manually starting the deploy
job in GitLab.

1. When changes are merged into `main`, CI validates, builds, and pushes the
   `backend` and `frontend` images, tagged **twice**: with the commit SHA and
   with `:latest`.
2. **Run the `deploy` job** from the pipeline's `deploy` stage (a manual
   button). It runs Ansible against app, pg and mongo in one go, whatever you
   changed. Services whose config and image didn't change keep running, so
   an app-only change doesn't restart the databases.

A deploy job pins the images to **its own pipeline's commit SHA**, not `:latest`
— and the runner checks out that same commit, so the Ansible roles and compose
files ship together with the images. A deploy is reproducible from one commit.

## Roll back production

Roll back application code by creating a **revert commit**. A revert does not
delete history: it adds a new commit that reverses the bad commit. CI then
builds new images from this clean state, so `main` and production stay aligned.

1. In GitLab, open _Code → Commits_ and select the bad commit.
2. Select _Options → Revert_, choose `main`, and create the revert merge request.
3. Merge the revert after its checks pass.
4. Wait for the new `main` pipeline to build both images, then run `deploy`.
5. Verify that the UI and login work.

## What deploys from where

| From          | Runs         | On             | What                                              |
|---------------|--------------|----------------|---------------------------------------------------|
| GitLab CI     | `deploy` job | app, pg, mongo | everything: firewall, Docker, TLS, compose stacks |
|               |              | ops            | TLS and the monitoring stack only                 |
| Laptop (rare) | `setup.sh`   | ops            | firewall, Docker, GitLab runner                   |

The runner lives on ops, so a CI job there must not restart Docker or the
runner: that would kill the job itself. Those parts of ops are applied from a
laptop by re-running `./deployment/setup.sh`, only when they change (or on a
new VM, see the [provisioning guide](provisioning.md)). Run it while no CI job
is running.
