#!/usr/bin/env bash
# copies env templates into /etc/ocean, prepares /srv/ocean data dirs.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${HERE}/../common/bootstrap-base.sh"

ETC_OCEAN="${ETC_OCEAN:-/etc/ocean}"
DATA_ROOT="${OCEAN_DATA_DIR:-/srv/ocean}"

install -d -m 0750 -o "${OCEAN_USER}" -g "${OCEAN_USER}" "${ETC_OCEAN}"

for name in compose backend postgres_orm pg_cluster mongodb_cluster openldap; do
  install -m 0600 -o "${OCEAN_USER}" -g "${OCEAN_USER}" \
    "${HERE}/env/${name}.env.example" "${ETC_OCEAN}/${name}.env"
  log "staged ${ETC_OCEAN}/${name}.env"
done

install -d -m 0750 -o "${OCEAN_USER}" -g "${OCEAN_USER}" "${DATA_ROOT}"
install -d -m 0700 -o 70 -g 70 "${DATA_ROOT}/postgres_orm/data"
install -d -m 0700 -o 999 -g 999 "${DATA_ROOT}/pg_cluster/data"
install -d -m 0700 -o 999 -g 999 "${DATA_ROOT}/mongodb_cluster/data"

log "single-vm bootstrap done."
