#!/usr/bin/env bash
# ==============================================================================
# HOOK_NAME — Brief description of what this hook does
# ==============================================================================
#
# Trigger: TODO (e.g., after file edits, after commits, before push)
# Scope:   TODO (e.g., all files, specific extensions)
#
# IMPORTANT: Hooks are non-blocking. Always exit 0 even on failure.
# This ensures the hook never interrupts the user's workflow.
#
# --- Hook Conventions ---
#
# 1. NEVER use set -e in hooks. The -e flag causes cascading failures when
#    any subcommand exits non-zero (jq not found, grep no match, etc.).
#    For high-frequency hooks (PreToolUse, PostToolUse), a failed hook injects
#    error text into the agent's context on EVERY tool call, wasting tokens
#    and polluting reasoning. Use `set -uo pipefail` instead and handle
#    errors explicitly with `|| return 0` or `|| true`.
#
# 2. TIMEOUTS: Never use GNU `timeout` in hook scripts — it doesn't exist
#    on macOS. Instead, set the "timeout" field (seconds) on the hook entry
#    in settings.json. Claude Code manages the process lifecycle natively.
#
#    Example settings.json entry:
#      {
#        "type": "command",
#        "command": "bash .claude/hooks/my-hook.sh",
#        "timeout": 120
#      }
#
# 3. NODE PATH: Non-interactive shells (how Claude Code runs hooks) don't
#    source ~/.bashrc or ~/.zshrc, so nvm/fnm/volta may not be loaded.
#    If your hook runs Node-based tools (pnpm, npm, npx, vitest, eslint,
#    prettier, etc.), source the shared PATH resolver:
#
#      source "$(dirname "$0")/_resolve-node-path.sh"
#
#    This resolves the correct Node version from .nvmrc if present.
#    See _resolve-node-path.sh for extending to fnm, volta, asdf, or mise.
#
# 4. RESILIENCE PATTERN: Wrap all logic in a main() function, then call it
#    with `main 2>/dev/null || true` and `exit 0`. This guarantees the hook
#    never exits non-zero regardless of what fails inside.
#
# ==============================================================================

# DO NOT use set -e — hooks must fail gracefully.
# A broken hook is worse than no hook (it wastes tokens on every invocation).
set -uo pipefail

# --- Node PATH (uncomment if this hook runs Node-based tools) ---
# source "$(dirname "$0")/_resolve-node-path.sh"

# --- Configuration ---
# TODO: Define any configurable variables
# HOOK_ENABLED=true
# TARGET_EXTENSIONS=("ts" "js" "py")

# --- Helper Functions ---
log_info() {
    echo "[HOOK_NAME] $*"
}

log_warn() {
    echo "[HOOK_NAME] WARNING: $*" >&2
}

# --- Main Logic ---
main() {
    # TODO: Implement hook logic here
    log_info "Running HOOK_NAME..."

    # Example: Read stdin (for PreToolUse/PostToolUse hooks that receive JSON)
    # INPUT=$(cat) || return 0

    # Example: Check if a tool is available
    # if ! command -v some_tool &>/dev/null; then
    #     log_warn "some_tool not found, skipping"
    #     return 0
    # fi

    # Example: Extract data from JSON input (jq with shell fallback)
    # local VALUE=""
    # if command -v jq &>/dev/null; then
    #     VALUE=$(echo "$INPUT" | jq -r '.some_field // empty' 2>/dev/null) || true
    # fi

    # TODO: Perform the hook's action
    # some_tool "$@"

    log_info "HOOK_NAME complete."
    return 0
}

# --- Entry Point ---
# Suppress ALL errors — a silent pass-through is always better than an error.
main "$@" 2>/dev/null || true
exit 0
