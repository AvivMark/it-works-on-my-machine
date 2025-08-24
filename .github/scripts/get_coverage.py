import json
import os
import sys

coverage_file = 'coverage/coverage-summary.json'
if not os.path.exists(coverage_file):
    print(f'coverage summary not found at {coverage_file}', file=sys.stderr)
    sys.exit(1)

with open(coverage_file, 'r') as f:
    summary = json.load(f)

pct = summary.get('total', {}).get('lines', {}).get('pct', 0)
threshold = float(os.environ.get('COVERAGE_THRESHOLD', '80'))

print(f'Coverage lines: {pct}% (threshold {threshold}%)')
if pct < threshold:
    print(f'Coverage {pct}% is below threshold {threshold}%', file=sys.stderr)
    sys.exit(1)