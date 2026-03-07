#!/usr/bin/env bash
# check-types — Runs type check before git commit. Exit 0=allow, 2=block.
# Customize TYPE_CHECK_COMMAND below. See _template-hook.sh for conventions.

set -euo pipefail

# --- Ensure Node is on PATH for non-interactive shells ---
source "$(dirname "$0")/_resolve-node-path.sh"

# --- Configuration ---
# Customize this to match your project's type-check command.
# Examples: "pnpm type-check", "npx tsc --noEmit", "mypy .", "go vet ./..."
# Set to empty string to disable this hook.
TYPE_CHECK_COMMAND="{{type_check_command}}"

# Skip if not configured or set to *(skip)*
if [ -z "$TYPE_CHECK_COMMAND" ] || [ "$TYPE_CHECK_COMMAND" = "*(skip)*" ]; then
  exit 0
fi

# Read the tool invocation from stdin
INPUT=$(cat)

# Extract the command from tool_input
COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"command"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

# Only check git commit commands
case "$COMMAND" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

echo "[check-types] Running type check..."

# Run type checking — timeout managed by Claude Code hook config
if $TYPE_CHECK_COMMAND 2>&1; then
  echo "[check-types] Type check passed."
  exit 0
else
  EXIT_CODE=$?
  echo "BLOCKED: Type check failed." >&2
  echo "" >&2
  echo "Type command '$TYPE_CHECK_COMMAND' failed (exit code: $EXIT_CODE)." >&2
  echo "" >&2
  echo "Fix type errors before committing. Tests passing does NOT guarantee" >&2
  echo "type safety — most test runners strip types before execution." >&2
  exit 2
fi
