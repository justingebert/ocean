#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LIMA_CONFIG="${REPO_ROOT}/ops/lima/ocean-debian.yaml"
ANSIBLE_DIR="${REPO_ROOT}/ops/ansible"
INSTANCE="${LIMA_INSTANCE:-ocean}"

log() { echo "[lima] $*"; }

require() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "[lima] missing required tool: $1" >&2
    exit 1
  }
}

require limactl
require ansible-playbook
require ansible-galaxy

if limactl list "${INSTANCE}" >/dev/null 2>&1; then
  log "starting existing Lima instance ${INSTANCE}"
  limactl start --tty=false "${INSTANCE}"
else
  log "creating Debian 13 Lima instance ${INSTANCE}"
  limactl start --tty=false --name="${INSTANCE}" "${LIMA_CONFIG}"
fi

cd "${ANSIBLE_DIR}"

log "installing required Ansible collections"
ansible-galaxy collection install -r requirements.yml >/dev/null

log "running Ansible playbook"
ansible-playbook -i inventory.yml playbook.yml
