#!/usr/bin/env bash
# installs Docker + compose plugin, creates the ocean user.

set -euo pipefail

OCEAN_USER="${OCEAN_USER:-ocean}"
OCEAN_HOME="/home/${OCEAN_USER}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "must run as root (use sudo)" >&2
  exit 1
fi

log() { echo "[base] $*"; }

log "apt update + base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y --no-install-recommends ca-certificates curl git

log "installing Docker Engine + compose plugin via get.docker.com"
curl -fsSL https://get.docker.com | sh

systemctl enable --now docker

log "creating ${OCEAN_USER} user"
useradd --create-home --shell /bin/bash "${OCEAN_USER}"
usermod -aG docker "${OCEAN_USER}"

install -d -m 0700 -o "${OCEAN_USER}" -g "${OCEAN_USER}" "${OCEAN_HOME}/.ssh"
install -m 0600 -o "${OCEAN_USER}" -g "${OCEAN_USER}" /dev/null "${OCEAN_HOME}/.ssh/authorized_keys"
