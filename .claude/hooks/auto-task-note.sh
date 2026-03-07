#!/usr/bin/env bash
# ==============================================================================
# auto-task-note — Automatically logs commit info to the task tracker
# ==============================================================================
#
# Trigger: PostToolUse on Bash when command matches "git commit"
# Purpose: Keeps task notes in sync with commits automatically
#
# Reads tool invocation JSON from stdin.
# Always exits 0 (non-blocking post-hook).
#
# Customize TASK_CLI, TASK_NOTE_COMMAND, and the task ID extraction pattern for your project.
# The /scaffold command sets these values based on your chosen task management tool.
# Examples of task CLIs: bd, gh, linear
#
# Configuration (.claude/settings.json):
#   {
#     "hooks": {
#       "PostToolUse": [
#         {
#           "matcher": "Bash",
#           "hooks": [
#             {
#               "type": "command",
#               "command": "bash .claude/hooks/auto-task-note.sh"
#             }
#           ]
#         }
#       ]
#     }
#   }
# ==============================================================================

set -euo pipefail

# --- Configuration (set by /scaffold) ---
# Customize for your task management CLI.
# Set to empty string to disable task note updates.
TASK_CLI="bd"

# Pattern to extract task ID from branch name.
# Default matches: prefix-TASKID/description
BRANCH_TASK_PATTERN='[A-Za-z]+-([0-9a-zA-Z]+)/'

# Command to append a note. Use {TASK_ID} and {NOTE} as placeholders.
# Examples:
#   bd:      "bd update {TASK_ID} --append-notes \"{NOTE}\""
#   gh:      "gh issue comment {TASK_ID} --body \"{NOTE}\""
#   linear:  "linear issue update {TASK_ID} --comment \"{NOTE}\""
TASK_NOTE_COMMAND='bd update {TASK_ID} --append-notes "{NOTE}"'

# --- Helper Functions ---
log_info() {
    echo "[auto-task-note] $*"
}

log_warn() {
    echo "[auto-task-note] WARNING: $*" >&2
}

# --- Main Logic ---
main() {
    # Skip if no task CLI configured
    if [ -z "$TASK_CLI" ]; then
        return 0
    fi

    # Check if task CLI is available
    if ! command -v "$TASK_CLI" &>/dev/null; then
        log_warn "$TASK_CLI not found, skipping task note."
        return 0
    fi

    # Read the tool invocation from stdin
    INPUT=$(cat)

    # Extract the command from tool_input
    COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"command"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

    # Only process git commit commands
    case "$COMMAND" in
        *"git commit"*) ;;
        *) return 0 ;;
    esac

    # Get branch name and extract task ID
    BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
    if [ -z "$BRANCH" ]; then
        log_warn "Not in a git repo, skipping."
        return 0
    fi

    TASK_ID=$(echo "$BRANCH" | grep -oP "$BRANCH_TASK_PATTERN" | head -1 | grep -oP '[0-9a-zA-Z]+' | tail -1 || echo "")
    if [ -z "$TASK_ID" ]; then
        log_warn "Could not extract task ID from branch: $BRANCH"
        return 0
    fi

    # Get the latest commit info
    COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    COMMIT_MSG=$(git log -1 --pretty=format:'%s' 2>/dev/null || echo "unknown")

    # Build the note
    NOTE="[done] Commit ${COMMIT_HASH}: ${COMMIT_MSG}"

    # Build and execute the task note command
    EXEC_CMD=$(echo "$TASK_NOTE_COMMAND" | sed "s/{TASK_ID}/$TASK_ID/g" | sed "s/{NOTE}/$NOTE/g")

    log_info "Adding note to task $TASK_ID..."
    eval "$EXEC_CMD" 2>/dev/null || log_warn "Failed to add note to task $TASK_ID"
}

# --- Entry Point ---
# Non-blocking: always exit 0
main || {
    log_warn "Auto task note failed, but continuing (non-blocking)."
    exit 0
}
