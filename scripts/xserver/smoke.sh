#!/usr/bin/env bash
# Checks the live production site after a deploy.
#
# Usage: smoke.sh <base-url> <built-dir>
#   e.g. smoke.sh https://pami.ooo dist/client
#
# For /, /about/, /events/ and the first event detail page in the build:
#   - HTTP 200 and an HTML content type          (required)
#   - the site's own markup marker                (required)
#   - no "noindex" X-Robots-Tag: that header is set by the Cloudflare
#     preview Worker, so its presence means we are not looking at XServer
#                                                 (required)
#   - byte-identical to the file just built       (warning only: a cache may lag)
set -euo pipefail

base="${1:?usage: smoke.sh <base-url> <built-dir>}"
built="${2:?usage: smoke.sh <base-url> <built-dir>}"
base="${base%/}"
attempts="${SMOKE_ATTEMPTS:-6}"
delay="${SMOKE_DELAY_SECONDS:-10}"
marker='data-room='

paths=(/ /about/ /events/)
first_event="$(find "$built/events" -mindepth 2 -maxdepth 2 -name index.html | sort | head -1 || true)"
if [ -n "$first_event" ]; then
  event_path="/${first_event#"$built"/}"
  paths+=("${event_path%index.html}")
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

failed=0
stale=0
for path in "${paths[@]}"; do
  ok=0
  for ((try = 1; try <= attempts; try++)); do
    code_type="$(curl -sS --max-time 20 --compressed -o "$tmp/body" -D "$tmp/headers" -w '%{http_code} %{content_type}' "$base$path" || true)"
    code="${code_type%% *}"
    type="${code_type#* }"
    robots="$(grep -i '^x-robots-tag:' "$tmp/headers" | tr -d '\r' || true)"
    if [ "$code" = "200" ] && [[ "$type" == text/html* ]] && grep -qF "$marker" "$tmp/body" && [[ "$robots" != *noindex* ]]; then
      ok=1
      break
    fi
    echo "  $path: attempt $try/$attempts → HTTP ${code:-none}, ${type:-no type}${robots:+, $robots}"
    [ "$try" -lt "$attempts" ] && sleep "$delay"
  done

  if [ "$ok" -ne 1 ]; then
    echo "::error::Smoke: $base$path did not serve the production page (last: HTTP ${code:-none}, ${type:-no type}${robots:+, $robots})"
    failed=$((failed + 1))
    continue
  fi

  local_file="$built${path}index.html"
  if [ -f "$local_file" ] && cmp -s "$tmp/body" "$local_file"; then
    echo "OK    $path (identical to this build)"
  else
    echo "::warning::Smoke: $path is up but differs from this build (cache or CDN may still be serving the previous version)"
    stale=$((stale + 1))
  fi
done

echo "Smoke summary: ${#paths[@]} checked, $failed failed, $stale not yet identical to this build."
[ "$failed" -eq 0 ]
