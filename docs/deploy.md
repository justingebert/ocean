# Deploy Guide

Ocean runs on three HTW VMs: **app**, **pg**, **mongo**. They're provisioned
once and then updated from GitLab CI, this page outlines how to depoy changes to the production servers.

> Want a fresh Deployment on your own VMs? [Provisioning new VMs](provisioning.md) covers setup with new VMs from scratch.
>
> New to the setup? [Deployment architecture](../deployment/README.md) explains the Infrastructure-as-Code in a page.

## Deploy a change to production

Changes are generally checked by CICD and then deployed by manually starting the deploy job in GitLab.

1. When Changes are merged into `main`, the CI validates, builds and pushes the `backend` and `frontend`
   images, tagged **twice**: with the commit SHA and with `:latest`.
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

## Rollback — TODO

Rollback: TODO
