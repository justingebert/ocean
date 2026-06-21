# Deploy Guide

Ocean runs on three HTW VMs: **app**, **pg**, **mongo**. They're provisioned
once and then updated from GitLab CI, this page outlines how to depoy changes to the production servier.

>Want a fresh Deployment on your own VMs? [Provisioning new VMs](provisioning.md) covers setup with new VMs from scratch.
>
>New to the setup? [Deployment architecture](../ops/README.md) explains the Infrastructure-as-Code in a page.

## Deploy a change to production

Changes are generally checked by CICD and then deployed by maunlly starting the deploy job.

1. When Changes are merged into `main`, the CI validates, builds and pushes the `backend` and `frontend`
   images, tagged `:latest`.
2. **Run the deploy job** for the tier you changed, from the pipeline's `deploy`
   stage (a manual button):

   | You changed                       | Run            |
   | --------------------------------- | -------------- |
   | Backend or frontend code          | `deploy:app`   |
   | The `pg` VM (config / inventory)  | `deploy:pg`    |
   | The `mongo` VM (config / inventory) | `deploy:mongo` |

Most changes are app code, so most deploys are just the `deploy:app` job.

Images are tagged `:latest`, so a deploy pulls the newest build. 

Rollback: TODO
