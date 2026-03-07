#!/usr/bin/env bash
# ==============================================================================
# check-commit-msg — Validates commit messages reference a task ID
# ==============================================================================
#
# Trigger: PreToolUse on Bash when command matches "git commit"
# Purpose: Ensures every commit is linked to a task
#
# Reads tool invocation JSON from stdin.
# Exit 0 = allow
# Exit 2 = block (stderr shown as error)
#
# Customize TASK_PATTERN to match your project's task ID format.
# Default pattern matches common formats: PROJECT-123, #123, PROJ-abc
#
# Configuration (.claude/settings.json):
#   {
#     "hooks": {
#       "PreToolUse": [
#         {
#           "matcher": "Bash",
#           "hooks": [
#             {
#               "type": "command",
#               "command": "bash .claude/hooks/check-commit-msg.sh"
#             }
#           ]
#         }
#       ]
#     }
#   }
# ==============================================================================

set -euo pipefail

# --- Configuration ---
# Customize this regex to match your project's task ID pattern.
# Examples:
#   PROJECT-[0-9a-z]+      -> PROJECT-507, PROJECT-7r1 (bd-style IDs)
#   #[0-9]+                -> #123, #456
#   [A-Z]+-[0-9]+          -> JIRA-123, LINEAR-456
TASK_PATTERN='[A-Za-z]+-[0-9a-zA-Z]+'

# Prefixes that are exempt from requiring a task ID
EXEMPT_PREFIXES='feat:\|fix:\|refactor:\|chore:\|docs:\|test:\|ci:\|build:\|perf:\|style:\|Docs:\|Chore:\|Meta:\|Release:'

# Read the tool invocation from stdin
INPUT=$(cat)

# Extract the command from tool_input
COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"command"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

# Only check git commit commands
case "$COMMAND" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

# Extract commit message (look for -m flag)
COMMIT_MSG=$(echo "$COMMAND" | grep -oP '(?<=-m\s")[^"]*' 2>/dev/null || echo "$COMMAND" | grep -oP "(?<=-m\s')[^']*" 2>/dev/null || echo "")

# If we can't extract the message (e.g., using heredoc or editor), allow it
if [ -z "$COMMIT_MSG" ]; then
  exit 0
fi

# Check for exempt prefixes
if echo "$COMMIT_MSG" | grep -qE "^($EXEMPT_PREFIXES)"; then
  echo "Commit message has exempt prefix, skipping task ID check."
  exit 0
fi

# Check for task ID pattern
if echo "$COMMIT_MSG" | grep -qE "$TASK_PATTERN"; then
  echo "Commit message references a task ID."
  exit 0
fi

echo "BLOCKED: Commit message must reference a task ID." >&2
echo "  Message: $COMMIT_MSG" >&2
echo "" >&2
echo "Expected pattern: $TASK_PATTERN" >&2
echo "  Example: \"Fix login redirect (MYAPP-507)\"" >&2
echo "" >&2
echo "Exempt prefixes: $EXEMPT_PREFIXES" >&2
echo "  Example: \"Docs: update README\"" >&2
exit 2
