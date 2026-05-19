## problems encountered:
- local monogdb server needs to be stopped
- when db creation fails it leaves danling orphan in the postgres orm metadata
- untrusted ca certificate for gitlab container registry
  - ca certicate needs rto be added to machine as trusted


## Ideas
- add mongo-express to mongosever
- env files for vms as gitlab secrets or secret files
- make sure PR cant execute ansible code on vm


## Questions:
- what about certificate renewal?


## stuff learned
- https://ai-master.htw-berlin.de/files/Stg/AI/AntragvirtuellerServer.pdf
- TLS certificates
- Caddy
- Docker compose override
- lima -> cool and easy for local vms
- Ansible overview 