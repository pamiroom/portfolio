#!/usr/bin/env bash
# Validates the XServer deploy path before anything is synced with --delete.
#
# Usage: guard-deploy-path.sh <path>
# Prints the normalised path (no trailing slash) on stdout when it is safe.
# Error messages never echo the path itself: it comes from a secret.
set -euo pipefail

fail() {
  echo "::error::Deploy path guard: $1" >&2
  exit 1
}

path="${1-}"
[ -n "$path" ] || fail "path is empty"
path="${path%/}"

[ "$path" != "" ] || fail "path is /"
[ "$path" != "/home" ] || fail "path is /home"
case "$path" in
  *..* | *//* | *' '*) fail "path must be a plain absolute path (no '..', '//' or spaces)" ;;
esac
case "$path" in
  */public_html) ;;
  *) fail "path must end with /public_html" ;;
esac
# Expected shape on XServer: /home/<account>/pami.ooo/public_html
[[ "$path" =~ ^/home/[A-Za-z0-9._-]+/pami\.ooo/public_html$ ]] ||
  fail "path must look like /home/<account>/pami.ooo/public_html"

printf '%s\n' "$path"
