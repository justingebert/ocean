#!/usr/bin/env bash
# Bring up three Lima VMs (app, pg, mongo), then run the Ansible playbook.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LIMA_DIR="${REPO_ROOT}/ops/lima"
ANSIBLE_DIR="${REPO_ROOT}/ops/ansible"

ROLES=(app pg mongo)

log() { echo "[lima] $*"; }

require() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "[lima] missing required tool: $1" >&2
    exit 1
  }
}

start_vm() {
  local role="$1"
  local instance="ocean-${role}"
  local config="${LIMA_DIR}/${role}-debian.yaml"

  if limactl list "${instance}" >/dev/null 2>&1; then
    log "starting existing instance ${instance}"
    limactl start --tty=false "${instance}"
  else
    log "creating instance ${instance}"
    limactl start --tty=false --name="${instance}" "${config}"
  fi
}

require limactl
require ansible-playbook
require ansible-galaxy

for role in "${ROLES[@]}"; do
  start_vm "${role}"
done

cd "${ANSIBLE_DIR}"

log "installing required Ansible collections"
ansible-galaxy collection install -r requirements.yml >/dev/null

log "running Ansible playbook"
ansible-playbook -i inventory.multi.yml playbook.multi.yml
