#!/usr/bin/env bash
# Tests for with-ssh-retry.sh using a fake ssh/rsync (never touches a server).
# Usage: bash scripts/xserver/with-ssh-retry.test.sh
set -uo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
wrapper="$here/with-ssh-retry.sh"
work="$(mktemp -d)"
[ -n "$work" ] && [ -d "$work" ] || { echo "mktemp failed" >&2; exit 1; }
trap 'rm -r -- "$work"' EXIT

# Fake command: pops the next scenario from $SEQ and prints realistic
# OpenSSH / rsync stderr, including user@host, an IP and /home paths that
# must never reach the wrapper's output.
cat >"$work/fake" <<'EOF'
#!/usr/bin/env bash
n=$(( $(cat "$COUNT" 2>/dev/null || echo 0) + 1 )); echo "$n" > "$COUNT"
scenario="$(sed -n "${n}p" "$SEQ")"
H='xs999999.xsrv.jp'; U='xs999999'; IP='203.0.113.7'
case "$scenario" in
  ok)            echo "OUTPUT-FROM-ATTEMPT-$n"; exit 0 ;;
  timeout)       echo "ssh: connect to host $H port 10022: Connection timed out" >&2; exit 255 ;;
  refused)       echo "ssh: connect to host $H port 10022: Connection refused" >&2; exit 255 ;;
  kexreset)      echo "kex_exchange_identification: read: Connection reset by peer" >&2; echo "Connection reset by $IP port 10022" >&2; exit 255 ;;
  perm)          echo "$U@$H: Permission denied (publickey,gssapi-keyex,gssapi-with-mic)." >&2; exit 255 ;;
  hostkey)       echo "No ED25519 host key is known for [$H]:10022 and you have requested strict checking." >&2; echo "Host key verification failed." >&2; exit 255 ;;
  hostchanged)   printf '@@@@@@@@@@@@\n@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @\n@@@@@@@@@@@@\nHost key verification failed.\n' >&2; exit 255 ;;
  config)        echo "/home/runner/.ssh/config: line 3: Bad configuration option: bogus" >&2; echo "/home/runner/.ssh/config: terminating, 1 bad configuration options" >&2; exit 255 ;;
  badkey)        echo "Load key \"/home/runner/.ssh/xserver_deploy\": invalid format" >&2; echo "$U@$H: Permission denied (publickey)." >&2; exit 255 ;;
  unknown)       echo "something nobody expected from $U@$H" >&2; exit 255 ;;
  timeout_exit1) echo "ssh: connect to host $H port 10022: Connection timed out" >&2; exit 1 ;;
  rsync_drop)    echo "client_loop: send disconnect: Broken pipe" >&2; echo "rsync: connection unexpectedly closed (4821 bytes received so far) [sender]" >&2; echo "rsync error: error in rsync protocol data stream (code 12) at io.c(232)" >&2; exit 12 ;;
  rsync_perm)    echo "rsync: [receiver] mkstemp \"/home/$U/pami.ooo/public_html/.index.html.Xy\" failed: Permission denied (13)" >&2; exit 23 ;;
esac
EOF
chmod +x "$work/fake"

pass=0
fail=0
check() {
  local name="$1" seq="$2" want_exit="$3" want_calls="$4" want_out="$5"
  local -a steps
  read -ra steps <<<"$seq"
  printf '%s\n' "${steps[@]}" >"$work/seq"
  : >"$work/count"
  SEQ="$work/seq" COUNT="$work/count" SSH_RETRY_DELAY_SECONDS=0 \
    bash "$wrapper" "SSH check" "$work/fake" >"$work/out" 2>"$work/err"
  local code=$? calls out leaks
  calls="$(cat "$work/count")"
  out="$(tr '\n' ' ' <"$work/out" | sed 's/ $//')"
  leaks="$(cat "$work/out" "$work/err" | grep -cE 'xs999999|203\.0\.113\.7|/home/')"
  if [ "$code" = "$want_exit" ] && [ "$calls" = "$want_calls" ] && [ "$out" = "$want_out" ] && [ "$leaks" = 0 ]; then
    pass=$((pass + 1))
    printf 'PASS %s\n' "$name"
  else
    fail=$((fail + 1))
    printf 'FAIL %s (exit=%s/%s calls=%s/%s stdout=%q leaks=%s)\n' "$name" "$code" "$want_exit" "$calls" "$want_calls" "$out" "$leaks"
  fi
}

check "1 first success"                         "ok"                         0   1 "OUTPUT-FROM-ATTEMPT-1"
check "2 timeout → success"                     "timeout ok"                 0   2 "OUTPUT-FROM-ATTEMPT-2"
check "3 timeout → timeout → success"           "timeout timeout ok"         0   3 "OUTPUT-FROM-ATTEMPT-3"
check "4 timeout ×3 → failure"                  "timeout timeout timeout ok" 255 3 ""
check "5 Permission denied → immediate"         "perm ok"                    255 1 ""
check "6 Host key verification → immediate"     "hostkey ok"                 255 1 ""
check "6b host identification changed"          "hostchanged ok"             255 1 ""
check "7 malformed SSH config → immediate"      "config ok"                  255 1 ""
check "8 invalid key file → immediate"          "badkey ok"                  255 1 ""
check "9 refused → success"                     "refused ok"                 0   2 "OUTPUT-FROM-ATTEMPT-2"
check "10 kex reset → success"                  "kexreset ok"                0   2 "OUTPUT-FROM-ATTEMPT-2"
check "11 unknown error → immediate"            "unknown ok"                 255 1 ""
check "12 timeout text but exit 1 → no retry"   "timeout_exit1 ok"           1   1 ""
check "13 rsync transport drop → success"       "rsync_drop ok"              0   2 "OUTPUT-FROM-ATTEMPT-2"
check "14 rsync remote permission → immediate"  "rsync_perm ok"              23  1 ""

echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
