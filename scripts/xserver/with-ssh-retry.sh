#!/usr/bin/env bash
# Runs an ssh/rsync command and retries it only when it failed because the
# network connection to XServer could not be made or was cut (GitHub-hosted
# runners occasionally time out reaching port 10022).
#
# Usage: with-ssh-retry.sh <label> <command> [args...]
#   SSH_RETRY_ATTEMPTS       (default 3)
#   SSH_RETRY_DELAY_SECONDS  (default 20)
#
# - Permanent errors (auth, host key, key file, ssh config, remote paths)
#   fail immediately; anything unrecognised is treated as permanent.
# - Raw stderr is never printed: it can contain user@host, paths or IPs.
#   Only a short category is logged.
# - stdout is printed only for the successful attempt, so a retried command
#   never duplicates output (e.g. rsync --itemize-changes).
set -uo pipefail

label="${1:?usage: with-ssh-retry.sh <label> <command> [args...]}"
shift
[ "$#" -gt 0 ] || { echo "with-ssh-retry.sh: no command given" >&2; exit 2; }

attempts="${SSH_RETRY_ATTEMPTS:-3}"
delay="${SSH_RETRY_DELAY_SECONDS:-20}"

out="$(mktemp)"
err="$(mktemp)"
trap 'rm -f "$out" "$err"' EXIT

# Checked first: any of these means retrying cannot help.
PERMANENT='Permission denied|Host key verification failed|REMOTE HOST IDENTIFICATION HAS CHANGED|host key is known for|Load key|UNPROTECTED PRIVATE KEY|bad permissions|Bad owner or permissions|invalid format|Bad configuration option|bad configuration options|Unsupported option|garbage at end of line|Too many authentication failures|Authentication failed|Unable to negotiate|no matching host key type|Name or service not known|nodename nor servname|No such file or directory'

# Connection-level failures before or during the transport (OpenSSH / rsync wording).
TRANSIENT='connect to host .* port [0-9]+: (Connection timed out|Operation timed out|Connection refused|Network is unreachable|No route to host)|Connection timed out during banner exchange|kex_exchange_identification: (read: Connection reset by peer|Connection closed by remote host)|Connection reset by [^ ]+ port [0-9]+|Connection closed by [^ ]+ port [0-9]+|client_loop: send disconnect: Broken pipe|packet_write_wait: Connection to .* Broken pipe|read error: Connection reset by peer|Temporary failure in name resolution'

# ssh exits 255 on transport failure; rsync exits 255 (from ssh) or 12 (stream cut).
TRANSIENT_EXIT_CODES=' 255 12 '

permanent_reason() {
  case "$1" in
    *'Host key verification failed'* | *'REMOTE HOST IDENTIFICATION'* | *'host key is known for'*) echo 'host key verification failed' ;;
    *'Permission denied'* | *'Too many authentication failures'* | *'Authentication failed'*) echo 'authentication or permission denied' ;;
    *'Load key'* | *'UNPROTECTED PRIVATE KEY'* | *'bad permissions'* | *'Bad owner or permissions'* | *'invalid format'*) echo 'SSH key or file permission problem' ;;
    *'configuration option'* | *'Unsupported option'* | *'garbage at end of line'*) echo 'SSH config error' ;;
    *'Unable to negotiate'* | *'no matching host key type'*) echo 'SSH algorithm negotiation failed' ;;
    *'Name or service not known'* | *'nodename nor servname'*) echo 'SSH host name does not resolve' ;;
    *'No such file or directory'*) echo 'remote or local path not found' ;;
    *) echo 'unrecognised error' ;;
  esac
}

transient_reason() {
  case "$1" in
    *'timed out'*) echo 'connection timed out' ;;
    *'Connection refused'*) echo 'connection refused' ;;
    *'unreachable'* | *'No route to host'*) echo 'network unreachable' ;;
    *'reset'*) echo 'connection reset' ;;
    *'Broken pipe'*) echo 'connection dropped' ;;
    *'Connection closed'*) echo 'connection closed before completion' ;;
    *'name resolution'*) echo 'temporary DNS failure' ;;
    *) echo 'network error' ;;
  esac
}

for ((attempt = 1; attempt <= attempts; attempt++)); do
  : >"$out"
  : >"$err"
  "$@" >"$out" 2>"$err"
  status=$?
  if [ "$status" -eq 0 ]; then
    cat "$out"
    [ "$attempt" -gt 1 ] && echo "$label: succeeded on attempt $attempt/$attempts." >&2
    exit 0
  fi

  stderr_text="$(cat "$err")"
  if grep -qE "$PERMANENT" "$err"; then
    echo "::error::$label failed: $(permanent_reason "$stderr_text") (exit $status). Not retried." >&2
    exit "$status"
  fi
  if [[ "$TRANSIENT_EXIT_CODES" != *" $status "* ]] || ! grep -qE "$TRANSIENT" "$err"; then
    echo "::error::$label failed: $(permanent_reason "$stderr_text") (exit $status). Not retried." >&2
    exit "$status"
  fi

  reason="$(transient_reason "$stderr_text")"
  if [ "$attempt" -lt "$attempts" ]; then
    echo "$label: attempt $attempt/$attempts failed with a transient network error ($reason). Retrying in ${delay}s..." >&2
    sleep "$delay"
  else
    echo "::error::$label failed after $attempts attempts: transient network error ($reason, exit $status)." >&2
    exit "$status"
  fi
done
