#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-}"
shift || true

ALSO_APPVERSION=false
ALSO_IMAGE_TAG=false
CHARTS_ROOT="charts"

while (( "$#" )); do
  case "$1" in
    --also-appversion) ALSO_APPVERSION=true ;;
    --also-image-tag)  ALSO_IMAGE_TAG=true ;;
    --charts-root)     CHARTS_ROOT="${2:?missing value for --charts-root}"; shift ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
  shift
done

if [[ -z "${VERSION}" ]]; then
  echo "usage: $0 <version> [--also-appversion] [--also-image-tag] [--charts-root charts]" >&2
  exit 2
fi

need() { command -v "$1" >/dev/null 2>&1 || { echo "missing $1" >&2; exit 1; }; }
if ! command -v yq >/dev/null 2>&1; then
  echo "yq not found; installing v4 to /usr/local/bin ..."
  sudo wget -qO /usr/local/bin/yq "https://github.com/mikefarah/yq/releases/download/v4.44.3/yq_linux_amd64"
  sudo chmod +x /usr/local/bin/yq
fi
need git
need yq
need awk

LAST_TAG="$(git describe --tags --abbrev=0 2>/dev/null || true)"
if [[ -n "$LAST_TAG" ]]; then
  RANGE="${LAST_TAG}..HEAD"
else
  RANGE="HEAD~1..HEAD"
fi

CHANGED_DIRS=$(
  git diff --name-only $RANGE -- "${CHARTS_ROOT}/" \
    | cut -d/ -f1-2 \
    | sort -u
)

if [[ -z "${CHANGED_DIRS}" ]]; then
  echo "no chart changes detected under '${CHARTS_ROOT}' in range ${RANGE}; nothing to bump."
  exit 0
fi

echo "detected changed charts:"
echo "${CHANGED_DIRS}"

bumped=()

bump_one() {
  local chart_dir="$1"
  local chart_yaml="${chart_dir}/Chart.yaml"
  local values_yaml="${chart_dir}/values.yaml"

  if [[ ! -f "${chart_yaml}" ]]; then
    echo "skip: ${chart_yaml} not found"
    return
  fi

  # Validate current version is semver-ish; if not, still overwrite.
  local current_ver
  current_ver="$(yq -r '.version // ""' "${chart_yaml}")"

  yq -i ".version = \"${VERSION}\"" "${chart_yaml}"
  echo "set ${chart_yaml} .version: ${current_ver:-<none>} -> ${VERSION}"

  if $ALSO_APPVERSION; then
    yq -i ".appVersion = \"${VERSION}\"" "${chart_yaml}"
    echo "set ${chart_yaml} .appVersion -> ${VERSION}"
  fi

  if $ALSO_IMAGE_TAG && [[ -f "${values_yaml}" ]]; then
    # only touch if key exists to avoid surprises
    if yq -e '.image.tag // empty' "${values_yaml}" >/dev/null 2>&1; then
      yq -i ".image.tag = \"${VERSION}\"" "${values_yaml}"
      echo "set ${values_yaml} .image.tag -> ${VERSION}"
    fi
  fi

  if command -v helm >/dev/null 2>&1; then
    helm lint "${chart_dir}" || { echo "helm lint failed for ${chart_dir}"; exit 1; }
  fi

  bumped+=("${chart_dir}")
}

# shellcheck disable=SC2086
for d in ${CHANGED_DIRS}; do
  bump_one "$d"
done

if ((${#bumped[@]}==0)); then
  echo "nothing bumped."
  exit 0
fi

echo
echo "bumped charts:"
printf ' - %s\n' "${bumped[@]}"

# for CI visibility (optional)
echo "BUMPED_CHARTS=${bumped[*]}"
