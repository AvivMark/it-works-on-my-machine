#!/usr/bin/env python3
"""Scan repository for internal/private IPs and internal hostnames.

Usage: python .github/scripts/check_internal_data.py
Env:
  INTERNAL_URLS - comma or semicolon separated literal strings to search for
"""
import os
import re
import sys
from pathlib import Path

ROOT = Path(os.environ.get('GITHUB_WORKSPACE', Path.cwd()))

IGNORE_DIRS = {".git", "node_modules", "dist", "build"}

PATTERNS = [
    # Private IPv4 ranges
    r"\b10\.(?:[0-9]{1,3}\.){2}[0-9]{1,3}\b",
    r"\b172\.(?:1[6-9]|2[0-9]|3[0-1])\.(?:[0-9]{1,3}\.)[0-9]{1,3}\b",
    r"\b192\.168\.(?:[0-9]{1,3}\.)[0-9]{1,3}\b",
    # Loopback and link-local
    r"\b127\.0\.0\.1\b",
    r"\b169\.254\.[0-9]{1,3}\.[0-9]{1,3}\b",
    # common internal domains
    r"\binternal\.[a-z0-9-]+\b",
    r"\bcorp\.[a-z0-9-]+\b",
    r"\bint\.[a-z0-9-]+\b",
    r"\bprivate\.[a-z0-9-]+\b",
    r"\biron\b",
]


def compile_patterns():
    return [re.compile(p, re.IGNORECASE) for p in PATTERNS]


def iter_files(root: Path):
    for p in root.rglob('*'):
        if p.is_dir():
            if p.name in IGNORE_DIRS:
                # skip entire directory
                yield from []
        else:
            # skip files in ignored dirs
            if any(part in IGNORE_DIRS for part in p.parts):
                continue
            # skip binary files heuristically by suffix
            if p.suffix in {'.png', '.jpg', '.jpeg', '.gif', '.exe', '.bin'}:
                continue
            yield p


def search_file(path: Path, regexes, literals):
    matches = []
    try:
        text = path.read_text(errors='replace')
    except Exception:
        return matches

    for r in regexes:
        for m in r.finditer(text):
            # compute line number
            start = text.count('\n', 0, m.start()) + 1
            snippet = text.splitlines()[start-1][:200]
            matches.append((path, start, snippet, m.group(0)))

    for lit in literals:
        for idx, line in enumerate(text.splitlines(), start=1):
            if lit.lower() in line.lower():
                matches.append((path, idx, line[:200], lit))
    return matches


def main():
    regexes = compile_patterns()
    raw = os.environ.get('INTERNAL_URLS', '')
    raw = raw.replace(';', ',')
    literals = [s.strip() for s in raw.split(',') if s.strip()]

    found = []
    for f in iter_files(ROOT):
        for m in search_file(f, regexes, literals):
            found.append(m)

    if found:
        print('\nInternal/unwanted data found:')
        for path, line, snippet, matched in found:
            print(f'{path}:{line}: {matched} -- {snippet}')
        sys.exit(1)

    print('No internal/unwanted data detected.')


if __name__ == '__main__':
    main()
