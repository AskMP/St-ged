#!/usr/bin/env bash
# enforce-bd-tasks — Blocks Claude's built-in TaskCreate/TaskUpdate/TaskList/TaskGet tools.
# All task management MUST go through bd (beads) CLI. Exit 0=allow, 2=block.
#
# This hook fires on PreToolUse for TaskCreate, TaskUpdate, TaskList, TaskGet.
# It unconditionally blocks these tools and directs the agent to use bd instead.

set -euo pipefail

# Read the tool invocation from stdin
INPUT=$(cat)

# Extract the tool name
TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

case "$TOOL_NAME" in
  TaskCreate|TaskUpdate|TaskList|TaskGet)
    echo "BLOCKED: Claude's built-in $TOOL_NAME is FORBIDDEN in this project." >&2
    echo "" >&2
    echo "ALL task management MUST go through bd (beads) CLI." >&2
    echo "" >&2
    echo "Instead of $TOOL_NAME, use:" >&2
    echo "  TaskCreate  →  bd create -t task -d \"DESC\" \"TITLE\"" >&2
    echo "  TaskUpdate  →  bd update OT-xxx -s STATUS / bd update OT-xxx --append-notes \"NOTE\"" >&2
    echo "  TaskList    →  bd list / bd ready / bd list -s in_progress" >&2
    echo "  TaskGet     →  bd show OT-xxx" >&2
    echo "" >&2
    echo "See .claude/agents/bd-operator.md for complete command reference." >&2
    exit 2
    ;;
  *)
    exit 0
    ;;
esac
