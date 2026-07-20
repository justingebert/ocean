#!/usr/bin/env bash
# Bootstrap an HTW Ocean VM so Ansible can take over.
#
# Exit codes:
#     0  success
#     1  not running as root
#     2  missing or malformed pubkey argument

set -euo pipefail

ANSIBLE_USER="ansible"
PUBKEY="${1:-}"

# ---------- preconditions ----------

if [[ "$(id -u)" -ne 0 ]]; then
  echo "ERROR: must run as root (use 'su -' first)." >&2
  exit 1
fi

if [[ -z "$PUBKEY" || "$PUBKEY" != ssh-* ]]; then
  echo "ERROR: pass the laptop SSH public key as the first argument." >&2
  echo "Usage: bash $0 \"ssh-ed25519 AAAA... your-key\"" >&2
  exit 2
fi

echo ">>> bootstrap: starting on $(hostname)"

# ---------- 1. install sudo ----------

if ! command -v sudo >/dev/null 2>&1; then
  echo ">>> installing sudo"
  apt-get update -qq
  apt-get install -y -qq sudo
else
  echo ">>> sudo already installed, skipping"
fi

# ---------- 2. create ansible user ----------

if ! id -u "$ANSIBLE_USER" >/dev/null 2>&1; then
  echo ">>> creating user $ANSIBLE_USER"
  adduser --disabled-password --gecos "" "$ANSIBLE_USER"
else
  echo ">>> user $ANSIBLE_USER already exists, skipping"
fi

# ---------- 3. install authorized_keys ----------

SSH_DIR="/home/$ANSIBLE_USER/.ssh"
AUTH_KEYS="$SSH_DIR/authorized_keys"

install -d -o "$ANSIBLE_USER" -g "$ANSIBLE_USER" -m 0700 "$SSH_DIR"

if [[ ! -f "$AUTH_KEYS" ]] || ! grep -qxF "$PUBKEY" "$AUTH_KEYS"; then
  echo ">>> installing pubkey for $ANSIBLE_USER"
  echo "$PUBKEY" >> "$AUTH_KEYS"
  chown "$ANSIBLE_USER:$ANSIBLE_USER" "$AUTH_KEYS"
  chmod 0600 "$AUTH_KEYS"
else
  echo ">>> pubkey already installed, skipping"
fi

# ---------- 4. NOPASSWD sudoers ----------

SUDOERS_FILE="/etc/sudoers.d/$ANSIBLE_USER"
SUDOERS_LINE="$ANSIBLE_USER ALL=(ALL) NOPASSWD:ALL"

if [[ ! -f "$SUDOERS_FILE" ]] || ! grep -qxF "$SUDOERS_LINE" "$SUDOERS_FILE"; then
  echo ">>> writing $SUDOERS_FILE"
  echo "$SUDOERS_LINE" > "$SUDOERS_FILE"
  chmod 0440 "$SUDOERS_FILE"
  visudo -cf "$SUDOERS_FILE" >/dev/null
else
  echo ">>> sudoers entry already present, skipping"
fi

echo ">>> bootstrap: done. Verify :"
echo "    ssh $ANSIBLE_USER@$(hostname) sudo whoami    # → root"
