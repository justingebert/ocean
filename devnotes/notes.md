## problems encountered:
- local monogdb server needs to be stopped
- when db creation fails it leaves danling orphan in the postgres orm metadata
- untrusted ca certificate for gitlab container registry
  - ca certicate needs rto be added to machine as trusted
- mongodb admin users needs to be set once, for a new one data dir needs to be deleted or, manually created
- could not connect to mongodb -> by default client tls certificate required, turned off as parameter
- local docker compose adminer only works with custom hba config
- ldap auth wasn't working when connecting to managed postgres, problems was missing lien in hba


## Ideas
- add mongo-express to mongosever
- env files for vms as gitlab secrets or secret files
- make sure PR cant execute ansible code on vm
- add precommit hooks with husky
- staging env? nah to complex and not nesseary right?
- monitoring of cpu, storage, memory network

## Questions:
- what about certificate renewal?
- sops or gitlab vars for secrets?
- admin tool?
- does reboot -> firewall.sh wipe docker firewall stuff?
- does mongo have any auth?


## stuff learned
- https://ai-master.htw-berlin.de/files/Stg/AI/AntragvirtuellerServer.pdf
- TLS certificates
- Caddy
- Docker compose override
- lima -> cool and easy for local vms
- Ansible overview 
- htw vms outgoign traffic gets routed thortugh a forward webproxy
- monogdb cert needs to be combined
- js starfunctions

## TODOs
- [ ] write down how to set up vm for ansible (ssh key setup)
- [ ] gitlab badges to readme