# Deploy Guide

Ocean's services run on three HTW VMs: **app**, **pg**, and **mongo**. A fourth
**ops** VM hosts the GitLab runner. The VMs are provisioned once and then
updated from GitLab CI; this page explains how to deploy changes to production.

> Want a fresh deployment on your own VMs? [Provisioning new VMs](provisioning.md) covers setup with new VMs from scratch.
>
> New to the setup? [Deployment architecture](../deployment/README.md) explains the Infrastructure-as-Code in a page.

## Deploy a change to production

Changes are checked by CI/CD and then deployed by manually starting the deploy
job in GitLab.

1. When changes are merged into `main`, CI validates, builds, and pushes the
   `backend` and `frontend` images, tagged **twice**: with the commit SHA and
   with `:latest`.
2. **Run the deploy job** for the tier you changed, from the pipeline's `deploy`
   stage (a manual button):

   | You changed                         | Run            |
   | ----------------------------------- | -------------- |
   | Backend or frontend code            | `deploy:app`   |
   | The `pg` VM (config / inventory)    | `deploy:pg`    |
   | The `mongo` VM (config / inventory) | `deploy:mongo` |

Most changes are app code, so most deploys are just the `deploy:app` job.

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
4. Wait for the new `main` pipeline to build both images, then run `deploy:app`.
5. Verify that the UI and login work.