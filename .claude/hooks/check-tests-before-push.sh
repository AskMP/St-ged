#!/usr/bin/env bash
# check-tests-before-push — Runs tests before git push. Exit 0=allow, 2=block.
# Customize TEST_COMMAND below. See _template-hook.sh for conventions.

set -euo pipefail

# --- Configuration ---
# Customize this to match your project's test command.
# Examples: "pnpm test", "npm test", "pytest", "go test ./...", "cargo test"
TEST_COMMAND="pnpm test"

# --- Ensure Node is on PATH for non-interactive shells ---
source "$(dirname "$0")/_resolve-node-path.sh"

# Read the tool invocation from stdin
INPUT=$(cat)

# Extract the command from tool_input
COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"command"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

# Only check git push commands
case "$COMMAND" in
  *"git push"*) ;;
  *) exit 0 ;;
esac

echo "[check-tests-before-push] Running tests before push..."

# Run tests — timeout is managed by Claude Code's hook timeout setting,
# not by this script. No GNU `timeout` needed (cross-platform safe).
if $TEST_COMMAND 2>&1; then
  echo "[check-tests-before-push] All tests passed. Push allowed."
  exit 0
else
  EXIT_CODE=$?
  echo "BLOCKED: Tests must pass before pushing." >&2
  echo "" >&2
  echo "Test command '$TEST_COMMAND' failed (exit code: $EXIT_CODE)." >&2
  echo "" >&2
  echo "Fix failing tests, then retry the push." >&2
  exit 2
fi
