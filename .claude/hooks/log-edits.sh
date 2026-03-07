#!/usr/bin/env bash
# ==============================================================================
# log-edits — Logs every Write/Edit to a session manifest file
# ==============================================================================
#
# Trigger: PostToolUse on Write and Edit tool calls
# Purpose: Track which files were modified during a session
#
# Creates .claude/session-manifest.log as an append-only log.
# Each entry: timestamp, tool name, file path
# Add .claude/session-manifest.log to .gitignore — it's transient.
#
# Always exits 0 (non-blocking post-hook).
#
# Configuration (.claude/settings.json):
#   {
#     "hooks": {
#       "PostToolUse": [
#         {
#           "matcher": "Write|Edit",
#           "hooks": [
#             {
#               "type": "command",
#               "command": "bash .claude/hooks/log-edits.sh"
#             }
#           ]
#         }
#       ]
#     }
#   }
# ==============================================================================

set -uo pipefail

# --- Configuration ---
MANIFEST_FILE=".claude/session-manifest.log"

INPUT=$(cat)

# Extract tool name (jq with grep/sed fallback)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null || \
  echo "$INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

# Extract file path
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || \
  echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

if [ -n "$FILE_PATH" ]; then
  # Ensure the .claude directory exists
  mkdir -p "$(dirname "$MANIFEST_FILE")" 2>/dev/null || true

  TIMESTAMP=$(date '+%Y-%m-%dT%H:%M:%S')
  echo "$TIMESTAMP $TOOL_NAME $FILE_PATH" >> "$MANIFEST_FILE" 2>/dev/null || true
fi

exit 0
