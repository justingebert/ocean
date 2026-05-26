## problems encountered:
- local monogdb server needs to be stopped
- when db creation fails it leaves danling orphan in the postgres orm metadata
- untrusted ca certificate for gitlab container registry
  - ca certicate needs rto be added to machine as trusted
- mongodb admin users needs to be set once, for a new one data dir needs to be deleted or, manually created


## Ideas
- add mongo-express to mongosever
- env files for vms as gitlab secrets or secret files
- make sure PR cant execute ansible code on vm
- add precommit hooks with husky
- 

## Questions:
- what about certificate renewal?
- sops or gitlab vars for secrets?
- admin tool?


## stuff learned
- https://ai-master.htw-berlin.de/files/Stg/AI/AntragvirtuellerServer.pdf
- TLS certificates
- Caddy
- Docker compose override
- lima -> cool and easy for local vms
- Ansible overview 
- htw vms outgoign traffic gets routed thortugh a forward webproxy
- monogdb cert needs to be combined

## TODOs
- [ ] write down how to set up vm for ansible (ssh key setup)