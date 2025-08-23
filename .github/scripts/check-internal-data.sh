#!/usr/bin/env bash
set -euo pipefail

# Scans the repository for likely internal/unwanted data such as private IPs
# and internal hostnames. Exits non-zero if anything is found.

ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || echo "$(pwd)")
cd "$ROOT_DIR"

# Patterns to search for (simple but broad)
patterns=(
  # Private IPv4 ranges
  "\b10\.(?:[0-9]{1,3}\.){2}[0-9]{1,3}\b"
  "\b172\.(?:1[6-9]|2[0-9]|3[0-1])\.(?:[0-9]{1,3}\.)[0-9]{1,3}\b"
  "\b192\.168\.(?:[0-9]{1,3}\.)[0-9]{1,3}\b"
  # Loopback and link-local
  "\b127\.0\.0\.1\b"
  "\b169\.254\.[0-9]{1,3}\.[0-9]{1,3}\b"
  # Common internal hostnames / domains - extend as needed
  "\binternal\.[a-z0-9-]+\b"
  "\bcorp\.[a-z0-9-]+\b"
  "\bint\.[a-z0-9-]+\b"
  "\bprivate\.[a-z0-9-]+\b"
  "\bmy-company\b"
)

# Files/paths to ignore (node_modules, .git, build outputs)
ignore_dirs=("node_modules" ".git" "dist" "build")

# Build grep exclude arguments
exclude_args=()
for d in "${ignore_dirs[@]}"; do
  exclude_args+=(--exclude-dir="$d")
done

found=0
report_file=$(mktemp)

for pat in "${patterns[@]}"; do
  # use grep -EnI --binary-files=without-match to scan text files
  if grep -EnI --binary-files=without-match "${pat}" "./" "${exclude_args[@]}" 2>/dev/null | tee -a "$report_file"; then
    found=1
  fi
done

if [ "$found" -ne 0 ]; then
  echo "\nInternal/unwanted data found in the repository. Review the matches below and remove or replace them with envs or config." >&2
  cat "$report_file" >&2
  rm -f "$report_file"
  exit 1
fi

rm -f "$report_file"
echo "No internal/unwanted data detected."
exit 0
