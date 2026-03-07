#!/usr/bin/env bash
# check-coverage — Blocks git commit if coverage < threshold. Exit 0=allow, 2=block.
# Customize COVERAGE_COMMAND and MIN_COVERAGE below. See _template-hook.sh for conventions.

set -euo pipefail

# --- Ensure Node is on PATH for non-interactive shells ---
source "$(dirname "$0")/_resolve-node-path.sh"

# --- Configuration ---
# Customize these for your project.
COVERAGE_COMMAND="pnpm test -- --coverage --silent"
MIN_COVERAGE=75

# Read the tool invocation from stdin
INPUT=$(cat)

# Extract the command from tool_input
COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"command"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

# Only check git commit commands
case "$COMMAND" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

echo "[check-coverage] Running coverage check..."

# Run coverage and capture output — timeout managed by Claude Code hook config
COVERAGE_OUTPUT=$($COVERAGE_COMMAND 2>&1) || true

# Try to parse coverage percentage from common formats.
# Adjust the grep pattern for your test runner's output.
#
# Common formats:
#   "All files  |   78.5 |   82.1 |   75.3 |   80.2 |"  (Istanbul/Vitest/Jest)
#   "TOTAL   500   400    80%"  (pytest-cov)
#   "ok      coverage: 78.5% of statements"  (Go)
#
# This attempts to extract "All files" line from Istanbul-style output.
COVERAGE_PCT=$(echo "$COVERAGE_OUTPUT" | grep -E "All files" | head -1 | awk '{
  for (i=1; i<=NF; i++) {
    if ($i ~ /^[0-9]+(\.[0-9]+)?$/) {
      print $i;
      exit;
    }
  }
}')

# Fallback: try to find any percentage-like number near "coverage"
if [ -z "$COVERAGE_PCT" ]; then
  COVERAGE_PCT=$(echo "$COVERAGE_OUTPUT" | grep -oE '[0-9]+(\.[0-9]+)?%' | head -1 | tr -d '%')
fi

# If we couldn't parse coverage, allow the commit with a warning
if [ -z "$COVERAGE_PCT" ]; then
  echo "[check-coverage] WARNING: Could not parse coverage from output. Allowing commit."
  echo "[check-coverage] Customize COVERAGE_COMMAND and parsing for your test runner."
  exit 0
fi

# Compare coverage against threshold
# Use awk for float comparison
ABOVE_THRESHOLD=$(awk "BEGIN { print ($COVERAGE_PCT >= $MIN_COVERAGE) ? 1 : 0 }")

if [ "$ABOVE_THRESHOLD" -eq 1 ]; then
  echo "[check-coverage] Coverage: ${COVERAGE_PCT}% (minimum: ${MIN_COVERAGE}%). OK."
  exit 0
else
  echo "BLOCKED: Coverage dropped below ${MIN_COVERAGE}%." >&2
  echo "  Current coverage: ${COVERAGE_PCT}%" >&2
  echo "  Minimum required: ${MIN_COVERAGE}%" >&2
  echo "" >&2
  echo "Add tests for uncovered code before committing." >&2
  exit 2
fi
