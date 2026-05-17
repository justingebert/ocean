#!/usr/bin/env bash
# Build and run the single-VM deployment path inside a local Debian 13 Lima VM.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LIMA_CONFIG="${REPO_ROOT}/ops/lima/ocean-debian.yaml"
INSTANCE="${LIMA_INSTANCE:-ocean}"
HOST_PORT="8088"
SKIP_BUILD="${SKIP_BUILD:-0}"

log() { echo "[lima] $*"; }

vm_sudo() {
  limactl shell "${INSTANCE}" sudo "$@"
}

vm_sudo_bash() {
  limactl shell "${INSTANCE}" sudo bash -lc "$1"
}

shell_quote() {
  printf "%q" "$1"
}

if limactl list "${INSTANCE}" >/dev/null 2>&1; then
  log "starting existing Lima instance ${INSTANCE}"
  limactl start --tty=false "${INSTANCE}"
else
  log "creating Debian 13 Lima instance ${INSTANCE}"
  limactl start --tty=false --name="${INSTANCE}" "${LIMA_CONFIG}"
fi

log "bootstrapping Debian VM with the same script used for the university VM"
vm_sudo bash "${REPO_ROOT}/ops/single-vm/bootstrap.sh"

if [[ "${SKIP_BUILD}" != "1" ]]; then
  log "building backend image inside Lima"
  vm_sudo docker build --network=host -t ocean-backend:latest "${REPO_ROOT}/backend"

  log "building frontend image inside Lima"
  vm_sudo docker build --network=host \
    --build-arg VITE_API_URL=/v1 \
    --build-arg VITE_POSTGRESQL_HOSTNAME=localhost \
    --build-arg VITE_POSTGRESQL_PORT=5555 \
    --build-arg VITE_MONGODB_HOSTNAME=localhost \
    --build-arg VITE_MONGODB_PORT=27017 \
    --build-arg VITE_ADMINER_URL= \
    --build-arg VITE_ISSUE_LINK=https://github.com/HTWHub/ocean/issues \
    -t ocean-frontend:latest "${REPO_ROOT}/frontend"
else
  log "SKIP_BUILD=1, reusing existing ocean-backend/ocean-frontend images"
fi

compose_dir="$(shell_quote "${REPO_ROOT}/ops/single-vm")"
log "starting production compose stack"
vm_sudo_bash "cd ${compose_dir} && docker compose --env-file /etc/ocean/compose.env config >/dev/null"
vm_sudo_bash "cd ${compose_dir} && docker compose --env-file /etc/ocean/compose.env up -d --remove-orphans"
vm_sudo_bash "cd ${compose_dir} && docker compose --env-file /etc/ocean/compose.env ps"
