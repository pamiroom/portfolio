#!/usr/bin/env bash
# Refuses to deploy a build that is incomplete or could leak secrets.
#
# Usage: check-artifact.sh <dir>            (normally dist/client)
# Reads MICROCMS_API_KEY from the environment (if set) and searches for it
# without ever printing it.
set -euo pipefail

dir="${1:?usage: check-artifact.sh <dir>}"
errors=0
fail() {
  echo "::error::Artifact check: $1" >&2
  errors=$((errors + 1))
}

[ -d "$dir" ] || {
  echo "::error::Artifact check: $dir does not exist" >&2
  exit 1
}
[ -n "$(find "$dir" -mindepth 1 -print -quit)" ] || fail "$dir is empty"

for file in index.html about/index.html events/index.html 404.html; do
  [ -s "$dir/$file" ] || fail "missing $file"
done
[ -d "$dir/_astro" ] || fail "missing _astro/"

# Placeholder origin must never reach production.
if grep -rIlF 'pami.example' "$dir" >/dev/null; then
  fail "placeholder origin pami.example found in: $(grep -rIlF 'pami.example' "$dir" | head -5 | tr '\n' ' ')"
fi

# Secret files and server-only output must not be in the public folder.
leaked_files="$(find "$dir" \( -name '.env' -o -name '.env.*' -o -name '.dev.vars' -o -name '.dev.vars.*' -o -name 'wrangler.json' \) -print)"
[ -z "$leaked_files" ] || fail "secret or server files present: $(echo "$leaked_files" | tr '\n' ' ')"
[ ! -e "$dir/preview" ] || fail "preview/ must not be part of the static site"

# The API key value itself (passed via a process substitution, never as an argument or to stdout).
if [ -n "${MICROCMS_API_KEY-}" ]; then
  if grep -rlF -f <(printf '%s\n' "$MICROCMS_API_KEY") "$dir" >/dev/null; then
    fail "MICROCMS_API_KEY value found in: $(grep -rlF -f <(printf '%s\n' "$MICROCMS_API_KEY") "$dir" | head -5 | tr '\n' ' ')"
  fi
else
  fail "MICROCMS_API_KEY is not set, cannot verify the build does not contain it"
fi

if [ "$errors" -gt 0 ]; then
  echo "::error::Artifact check failed ($errors problem(s)); nothing was deployed." >&2
  exit 1
fi

echo "Artifact OK: $(find "$dir" -type f | wc -l | tr -d ' ') files, $(find "$dir" -name '*.html' | wc -l | tr -d ' ') HTML pages."
