#!/usr/bin/env bash
# ==============================================================================
# check-loc-threshold — Warn when a source file exceeds the LOC threshold
# ==============================================================================
#
# Trigger: PostToolUse (Write|Edit)
# Scope:   Source files (excludes tests, generated files, configs)
#
# IMPORTANT: Hooks are non-blocking. Always exit 0 even on failure.
#
# Governance: Standard+ (Rule S1)
# Default threshold: 400 lines. Override via LOC_FILE_THRESHOLD env var.
#
# ==============================================================================

# DO NOT use set -e — hooks must fail gracefully.
set -uo pipefail

# --- Configuration ---
LOC_FILE_THRESHOLD="${LOC_FILE_THRESHOLD:-400}"

# --- Helper Functions ---
log_info() {
    echo "[check-loc-threshold] $*"
}

log_warn() {
    echo "[check-loc-threshold] WARNING: $*" >&2
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

    # Skip test files
    case "$FILE_PATH" in
        *.test.*|*.spec.*|*__tests__*|*test_*|*_test.*|*tests/*|*.stories.*)
            return 0
            ;;
    esac

    # Skip generated files and configs
    case "$FILE_PATH" in
        *.lock|*.min.*|*.generated.*|*.d.ts|*package.json|*tsconfig.json|*.config.*|*.json|*.yaml|*.yml|*.toml|*.md)
            return 0
            ;;
    esac

    # Skip non-source files
    case "$FILE_PATH" in
        *.ts|*.tsx|*.js|*.jsx|*.py|*.go|*.rs|*.java|*.kt|*.rb|*.ex|*.exs|*.php|*.swift|*.cs)
            # These are source files, proceed
            ;;
        *)
            return 0
            ;;
    esac

    # Count lines
    local LINE_COUNT
    LINE_COUNT=$(wc -l < "$FILE_PATH" 2>/dev/null | tr -d ' ') || return 0

    if [ "$LINE_COUNT" -gt "$LOC_FILE_THRESHOLD" ]; then
        log_warn "$FILE_PATH has $LINE_COUNT lines (threshold: $LOC_FILE_THRESHOLD)"
        log_warn "Consider extracting a logical subsection to keep files focused."
        log_warn "See agent-governance skill (Rule S1) for guidance."
    fi

    return 0
}

# --- Entry Point ---
# Suppress ALL errors — a silent pass-through is always better than an error.
main "$@" 2>/dev/null || true
exit 0
