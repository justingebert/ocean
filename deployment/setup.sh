#!/usr/bin/env bash
# One-time laptop setup for a fresh Ocean deployment, see docs/provisioning.md.
# Safe to re-run: every step skips what is already done.
#
# Usage: ./deployment/setup.sh
#        OCEAN_SSH_KEY=~/.ssh/other_key ./deployment/setup.sh   # use an existing deploy key

set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
INVENTORY="$REPO/deployment/ansible/inventory.yml"
KEY="${OCEAN_SSH_KEY:-$HOME/.ssh/ocean_ansible}"
SECRETS="$REPO/.secrets/ci-variables.env"
CI_SECRETS="OCEAN_APPLICATION_SECRET OCEAN_JWT_SECRET OCEAN_POSTGRES_ORM_PASSWORD OCEAN_PG_CLUSTER_PASSWORD OCEAN_MONGODB_CLUSTER_PASSWORD OCEAN_OPS_PASSWORD"

step() { printf '\n\033[1m== %s\033[0m\n' "$*"; }
die() { printf '\033[31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

# One line per inventory host: group fqdn ip cert key ("-" when unset).
hosts_table() {
  awk '
    function flush() { if (host) print group, fqdn, ip, cert, key; host = "" }
    /^    [a-z]+:$/    { flush(); group = $1; sub(/:$/, "", group) }
    /^        [^ ]+:$/ { flush(); host = $1; fqdn = ip = cert = key = "-" }
    host && $1 == "ansible_host:"  { fqdn = $2 }
    host && $1 == "ip:"            { ip = $2 }
    host && $1 == "tls_cert_file:" { cert = $2 }
    host && $1 == "tls_key_file:"  { key = $2 }
    END { flush() }
  ' "$INVENTORY"
}

# SSH as the ansible user with only the deploy key, like CI does.
ssh_ansible() {
  ssh -n -i "$KEY" -o IdentitiesOnly=yes -o BatchMode=yes -o ConnectTimeout=10 \
    -o StrictHostKeyChecking=accept-new "ansible@$1" "${@:2}"
}

# ---------- 1. prerequisites and inventory ----------

step "1/6 Check prerequisites"
for cmd in docker ssh ssh-keygen openssl awk; do
  command -v "$cmd" >/dev/null || die "$cmd not found, install it first."
done
docker info >/dev/null 2>&1 || die "Docker is not running, start it first."

HOSTS="$(hosts_table)"
FQDNS="$(echo "$HOSTS" | awk '{ print $2 }')"
OPS_FQDN="$(echo "$HOSTS" | awk '$1 == "ops" { print $2 }')"
OPS_IP="$(echo "$HOSTS" | awk '$1 == "ops" { print $3 }')"
[ -n "$OPS_FQDN" ] || die "No ops host in $INVENTORY."

echo "Inventory (check for leftovers from the old VMs):"
echo "$HOSTS" | awk '{ printf "  %-6s %-34s %s\n", $1, $2, ($3 == "-" ? "" : "ip " $3) }'
echo "Deploy key: $KEY"

# ---------- 2. deploy key ----------

step "2/6 Deploy key"
if [ -f "$KEY" ]; then
  echo "Using existing $KEY"
else
  (umask 077 && mkdir -p "$(dirname "$KEY")")
  ssh-keygen -q -t ed25519 -N '' -C ocean-ansible -f "$KEY"
  echo "Created $KEY"
fi
# CI can't unlock a passphrase, so the key must not have one.
PUBKEY="$(ssh-keygen -y -P '' -f "$KEY")" || die "Can't read $KEY without a passphrase."

# ---------- 3. ansible user on every VM ----------

step "3/6 Give Ansible access to each VM"
for fqdn in $FQDNS; do
  if err="$(ssh_ansible "$fqdn" sudo -n true 2>&1)"; then
    echo "$fqdn: ready"
    continue
  fi
  case "$err" in
    *"Permission denied"* | *sudo:*) ;; # reachable, just not prepared yet
    *) die "$fqdn: can't connect ($err). On the HTW network or VPN?" ;;
  esac

  echo "$fqdn: not prepared yet, logging in with the HTW account."
  read -rp "  HTW login user on $fqdn: " vm_user
  remote="$vm_user@$fqdn"
  # One shared connection, so the login password is asked only once.
  ctl="$HOME/.ssh/ocean-setup-%C"
  ssh -o ControlMaster=yes -o ControlPath="$ctl" -o ControlPersist=120 \
    -o StrictHostKeyChecking=accept-new -fN "$remote"
  ssh -o ControlPath="$ctl" "$remote" 'cat > /tmp/prepare-vm.sh' <"$REPO/deployment/prepare-vm.sh"
  echo "  su asks for the root password of $fqdn:"
  run="bash /tmp/prepare-vm.sh $(printf %q "$PUBKEY")"
  ssh -t -o ControlPath="$ctl" "$remote" "su - -c $(printf %q "$run"); rm -f /tmp/prepare-vm.sh"
  ssh -o ControlPath="$ctl" -O exit "$remote" 2>/dev/null || true

  ssh_ansible "$fqdn" sudo -n true || die "$fqdn: Ansible still can't log in, see the output above."
  echo "$fqdn: ready"
done

# ---------- 4. ops ip ----------

# A wrong ip fails silently: the other VMs' firewalls just drop the log agents' traffic.
step "4/6 Check the ops ip"
addrs="$(ssh_ansible "$OPS_FQDN" hostname -I)"
case " $addrs " in
  *" $OPS_IP "*) echo "ip $OPS_IP matches $OPS_FQDN" ;;
  *) die "inventory.yml has ip '$OPS_IP' for ops, but $OPS_FQDN has: $addrs" ;;
esac

# ---------- 5. ops: firewall, Docker, runner ----------

step "5/6 Firewall, Docker and GitLab runner on ops"
token=""
if ssh_ansible "$OPS_FQDN" "sudo -n grep -qs '^\[\[runners\]\]' /etc/gitlab-runner/config.toml"; then
  echo "Runner already registered."
else
  cat <<'EOF'
In GitLab open Settings → CI/CD → Runners → Create project runner:
  - Linux, tag: ocean, assigned to this project only
  - create it, then copy the runner authentication token (glrt-...)
EOF
  read -rsp "Runner token (hidden): " token
  echo
  [ -n "$token" ] || die "No token given."
fi

# Same Alpine + Ansible as CI, so nothing gets installed on the laptop.
GITLAB_RUNNER_TOKEN="$token" docker run --rm -t \
  -e GITLAB_RUNNER_TOKEN \
  -e ANSIBLE_SSH_COMMON_ARGS="-o StrictHostKeyChecking=accept-new" \
  -v "$REPO/deployment:/deployment:ro" \
  -v "$KEY:/key:ro" \
  -w /deployment/ansible \
  alpine:3.20 sh -euc '
    apk add --no-cache --quiet --no-progress ansible openssh-client
    install -m 700 -d ~/.ssh && install -m 600 /key ~/.ssh/id_ed25519
    ansible-galaxy collection install -r requirements.yml >/dev/null
    ansible-playbook -i inventory.yml ops-bootstrap.yml
  '

# ---------- 6. what to enter in GitLab ----------

step "6/6 GitLab: CI/CD variables and Secure Files"
if [ -f "$SECRETS" ]; then
  echo "Reusing the values from $SECRETS"
else
  (
    umask 077 && mkdir -p "$(dirname "$SECRETS")"
    for name in $CI_SECRETS; do echo "$name=$(openssl rand -hex 32)"; done >"$SECRETS"
  )
  echo "Generated new values into $SECRETS"
  echo "If these variables already exist in GitLab, keep the GitLab values (the databases use them)."
fi

cat <<EOF

Settings → CI/CD → Variables. For each: Protect variable on, Expand variable reference off.

  Type Variable, Visibility Masked:
EOF
while IFS='=' read -r name value; do printf '    %-32s %s\n' "$name" "$value"; done <"$SECRETS"
cat <<EOF

  Type File, Visibility Visible (a multiline key can't be masked):
    ANSIBLE_SSH_PRIVATE_KEY          the whole file $KEY,
                                     including the BEGIN/END lines and the final newline

Settings → CI/CD → Secure Files, upload these 8 files with exactly these names:
EOF
echo "$HOSTS" | awk '{ print "    " $4; print "    " $5 }'
cat <<EOF

Then run the 'deploy' job of the latest main pipeline.
Once the values are in GitLab you can delete $SECRETS: GitLab is the source of truth.
EOF
