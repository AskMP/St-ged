#!/usr/bin/env bash
# ==============================================================================
# check-branch — Branch guard: blocks Write/Edit on main branch
# ==============================================================================
#
# Trigger: PreToolUse on Write and Edit tool calls
# Purpose: Prevents code changes directly on main/master branch
#
# Reads tool invocation JSON from stdin (contains tool_name and tool_input).
# Exit 0 = allow (stdout shown as informational context)
# Exit 2 = block (stderr shown as error to the agent)
#
# Exceptions: documentation (.md), config (.claude/), and task data files
# can be edited on main.
#
# IMPORTANT: Must be idempotent and fast (runs on every matching tool call).
#
# Configuration (.claude/settings.json):
#   {
#     "hooks": {
#       "PreToolUse": [
#         {
#           "matcher": "Write|Edit",
#           "hooks": [
#             {
#               "type": "command",
#               "command": "bash .claude/hooks/check-branch.sh"
#             }
#           ]
#         }
#       ]
#     }
#   }
# ==============================================================================

set -euo pipefail

# --- Configuration ---
# Path to task data directory. Set to empty string if no task CLI is used.
TASK_DATA_PATH=".beads/"

# Read the tool invocation from stdin
INPUT=$(cat)

# Extract tool name from the JSON input
TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

# Only check Write and Edit tools
case "$TOOL_NAME" in
  Write|Edit) ;;
  *) exit 0 ;;
esac

# Extract the file path from tool_input.file_path
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  # Allow exceptions: docs, config, and task data files can be edited on main
  case "$FILE_PATH" in
    */.claude/*|*/.claude)
      echo "Allowed: Claude config ($FILE_PATH) on $BRANCH."
      exit 0
      ;;
    */claude.md|*/CLAUDE.md|*claude.md)
      echo "Allowed: Claude config ($FILE_PATH) on $BRANCH."
      exit 0
      ;;
    *.md)
      echo "Allowed: Documentation ($FILE_PATH) on $BRANCH."
      exit 0
      ;;
    # Task data files — path set by /scaffold
    *)
      if [ -n "$TASK_DATA_PATH" ] && echo "$FILE_PATH" | grep -q "$TASK_DATA_PATH"; then
        echo "Allowed: Task data ($FILE_PATH) on $BRANCH."
        exit 0
      fi
      ;;
    # Add project-specific exceptions here, e.g.:
    # */your-data-dir/*)
    #   echo "Allowed: Data file ($FILE_PATH) on $BRANCH."
    #   exit 0
    #   ;;
  esac

  echo "BLOCKED: You are on the '$BRANCH' branch. Code changes require a feature branch." >&2
  echo "  File: $FILE_PATH" >&2
  echo "" >&2
  echo "Create a feature branch first:" >&2
  echo "  1. Create a task: bd create -t task -d \"DESC\" \"TITLE\"" >&2
  echo "  2. git checkout -b <prefix>-<task-id>/<description>" >&2
  echo "" >&2
  echo "Or use /session-start to automate setup." >&2
  exit 2
fi

# On a feature branch — allow with a reminder
echo "Branch: $BRANCH"
echo "Reminder: Update your task notes before committing."
exit 0
