#!/usr/bin/env bash
# ==============================================================================
# ascii-punctuation — Warn when files contain non-ASCII punctuation
# ==============================================================================
#
# Trigger: PostToolUse (Write|Edit)
# Scope:   All text files
#
# IMPORTANT: Hooks are non-blocking. Always exit 0 even on failure.
#
# Governance: Minimal+ (Rule M4)
# Detects smart quotes, em-dashes, curly apostrophes, and other non-ASCII
# punctuation that can cause encoding issues and inconsistent rendering.
#
# ==============================================================================

# DO NOT use set -e — hooks must fail gracefully.
set -uo pipefail

# --- Helper Functions ---
log_info() {
    echo "[ascii-punctuation] $*"
}

log_warn() {
    echo "[ascii-punctuation] WARNING: $*" >&2
}

# --- Main Logic ---
main() {
    # Read JSON input from stdin (PostToolUse provides tool call details)
    local INPUT
    INPUT=$(cat) || return 0

    # Extract the file path from the tool result
    local FILE_PATH=""
    if command -v jq &>/dev/null; then
        FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filePath // empty' 2>/dev/null) || true
    fi

    # If no file path found, nothing to check
    [ -z "$FILE_PATH" ] && return 0

    # Skip non-existent files
    [ -f "$FILE_PATH" ] || return 0

    # Skip binary files and common non-text extensions
    case "$FILE_PATH" in
        *.png|*.jpg|*.jpeg|*.gif|*.ico|*.woff|*.woff2|*.ttf|*.eot|*.svg|*.zip|*.tar|*.gz|*.lock)
            return 0
            ;;
    esac

    # Check for non-ASCII punctuation using grep -P (Perl regex)
    # Characters detected: smart quotes, em/en dashes, curly apostrophes, ellipsis, etc.
    local MATCHES=""
    if command -v grep &>/dev/null; then
        MATCHES=$(grep -Pn '[\x{2018}\x{2019}\x{201C}\x{201D}\x{2013}\x{2014}\x{2026}\x{00AB}\x{00BB}\x{2039}\x{203A}]' "$FILE_PATH" 2>/dev/null) || true
    fi

    if [ -n "$MATCHES" ]; then
        local COUNT
        COUNT=$(echo "$MATCHES" | wc -l | tr -d ' ')
        log_warn "Found $COUNT line(s) with non-ASCII punctuation in $FILE_PATH"
        log_warn "Replace smart quotes (\xe2\x80\x9c \xe2\x80\x9d), curly apostrophes (\xe2\x80\x98 \xe2\x80\x99), em-dashes (\xe2\x80\x94), en-dashes (\xe2\x80\x93) with ASCII equivalents."
        echo "$MATCHES" | head -5
        if [ "$COUNT" -gt 5 ]; then
            log_warn "... and $(( COUNT - 5 )) more line(s)"
        fi
    fi

    return 0
}

# --- Entry Point ---
# Suppress ALL errors — a silent pass-through is always better than an error.
main "$@" 2>/dev/null || true
exit 0
