#!/usr/bin/env bash
# ==============================================================================
# large-file-guard — Warns when reading large files without a line range
# ==============================================================================
#
# Trigger: PreToolUse on Read tool calls
# Purpose: Protect context window from being consumed by large file reads
#
# Does NOT block — injects advisory context so the agent can self-correct.
# Exit 0 = allow (stdout shown as context to the agent)
#
# IMPORTANT: This hook fires on EVERY Read call. It must:
#   1. Never exit non-zero (would inject error messages into context)
#   2. Be as fast as possible (no external deps beyond coreutils)
#   3. Fail silently — a broken guard is worse than no guard
#
# Configuration (.claude/settings.json):
#   {
#     "hooks": {
#       "PreToolUse": [
#         {
#           "matcher": "Read",
#           "hooks": [
#             {
#               "type": "command",
#               "command": "bash .claude/hooks/large-file-guard.sh"
#             }
#           ]
#         }
#       ]
#     }
#   }
# ==============================================================================

# DO NOT use set -e — this hook must never exit non-zero.
# A failed guard wastes more tokens than no guard at all.
set -uo pipefail

# --- Configuration ---
LARGE_FILE_THRESHOLD=500

# Wrap everything in a function so we can trap errors
main() {
    INPUT=$(cat) || return 0

    # Fast path: check if offset or limit are present (string match, no JSON parsing)
    case "$INPUT" in
        *'"offset"'*|*'"limit"'*) return 0 ;;
    esac

    # Extract file path — try jq first, fall back to shell string manipulation
    local FILE_PATH=""
    if command -v jq &>/dev/null; then
        FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null) || true
    fi

    # Fallback: extract with parameter expansion (no external commands)
    if [ -z "$FILE_PATH" ]; then
        # Match "file_path": "..." pattern
        local tmp="${INPUT#*\"file_path\"}"
        tmp="${tmp#*\"}"
        FILE_PATH="${tmp%%\"*}"
    fi

    # No file path found — nothing to check
    [ -z "$FILE_PATH" ] && return 0

    # File doesn't exist — let Read handle the error, not us
    [ -f "$FILE_PATH" ] || return 0

    # Check line count
    local LINE_COUNT
    LINE_COUNT=$(wc -l < "$FILE_PATH" 2>/dev/null | tr -d ' ') || return 0

    if [ "$LINE_COUNT" -gt "$LARGE_FILE_THRESHOLD" ]; then
        echo "WARNING: $FILE_PATH is $LINE_COUNT lines. Reading without offset/limit will consume significant context."
        echo "Consider: Read with offset and limit parameters to target specific sections."
        echo "Tip: Use Grep to find the relevant line numbers first, then Read with a range."
    fi

    return 0
}

# Run main, suppress ALL errors — a silent pass-through is always better than an error
main 2>/dev/null || true
exit 0
