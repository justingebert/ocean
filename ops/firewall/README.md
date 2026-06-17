# Firewall scripts (HTW VMs)

Reference `iptables` scripts, one per VM role. **Not yet wired into Ansible** —
applied manually per VM. They are the target end state and the seed for a future
`firewall` Ansible role.

Each script is the HTW base ruleset (default-DROP; allows loopback, established
connections, the HTW network `141.45.0.0/16` + `10.4.0.0/16`, the web proxy,
LDAPS, SSH, DNS, NTP) plus the one inbound port that role needs:

| Script              | Opens inbound        |
| ------------------- | -------------------- |
| `app-firewall.sh`   | 80, 443 (HTTP/HTTPS) |
| `pg-firewall.sh`    | 5432 (PostgreSQL)    |
| `mongo-firewall.sh` | 27017 (MongoDB)      |

How to apply: see [`docs/deploy.md`](../../docs/deploy.md) → "Open the firewall".
Each script writes `/etc/firewall.conf` and an `if-up.d` hook so the rules
survive a reboot.
