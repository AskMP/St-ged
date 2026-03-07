#!/usr/bin/env bash
# ci-monitor — Snapshot CI status after gh pr create. Exit 0 always (non-blocking).
# See _template-hook.sh for conventions.

set -euo pipefail

# --- Helper Functions ---
log_info() {
    echo "[ci-monitor] $*"
}

log_warn() {
    echo "[ci-monitor] WARNING: $*" >&2
}

# --- Main Logic ---
main() {
    # Check if gh CLI is available
    if ! command -v gh &>/dev/null; then
        return 0
    fi

    # Read the tool invocation from stdin
    INPUT=$(cat)

    # Extract the command from tool_input
    COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"command"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

    # Only process gh pr create commands
    case "$COMMAND" in
        *"gh pr create"*) ;;
        *) return 0 ;;
    esac

    # Extract the tool result (stdout) which contains the PR URL
    TOOL_RESULT=$(echo "$INPUT" | grep -o '"stdout"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"stdout"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

    # Try to extract PR number from the URL (e.g., https://github.com/owner/repo/pull/36)
    PR_NUMBER=$(echo "$TOOL_RESULT" | grep -oE '/pull/[0-9]+' | grep -oE '[0-9]+' || echo "")

    if [ -z "$PR_NUMBER" ]; then
        # Fallback: get the most recent PR for the current branch
        PR_NUMBER=$(gh pr view --json number --jq '.number' 2>/dev/null || echo "")
    fi

    if [ -z "$PR_NUMBER" ]; then
        log_warn "Could not determine PR number, skipping CI monitor."
        return 0
    fi

    log_info "PR #${PR_NUMBER} created. Checking CI status..."

    # Snapshot: get current check status without waiting
    # Brief pause to let checks register (GitHub API lag)
    sleep 2

    CI_OUTPUT=$(gh pr checks "$PR_NUMBER" 2>&1) || true

    if [ -z "$CI_OUTPUT" ]; then
        echo ""
        echo "[CI-MONITOR] PR #${PR_NUMBER} created. No CI checks detected yet."
        echo "[CI-MONITOR] Checks may still be registering. To monitor:"
        echo "[CI-MONITOR]   gh pr checks ${PR_NUMBER} --watch"
        return 0
    fi

    # Count check statuses
    PASS_COUNT=$(echo "$CI_OUTPUT" | grep -c "pass" || echo "0")
    FAIL_COUNT=$(echo "$CI_OUTPUT" | grep -c "fail" || echo "0")
    PENDING_COUNT=$(echo "$CI_OUTPUT" | grep -c "pending\|queued\|in_progress\|waiting" || echo "0")

    echo ""
    if [ "$FAIL_COUNT" -gt 0 ]; then
        echo "[CI-MONITOR] FAILING: PR #${PR_NUMBER} has ${FAIL_COUNT} failed check(s)."
        echo "[CI-MONITOR] Details:"
        echo "$CI_OUTPUT" | grep "fail" | head -10
        echo "[CI-MONITOR] ACTION: Investigate failures. Run 'gh pr checks ${PR_NUMBER}' for full details."
    elif [ "$PENDING_COUNT" -gt 0 ]; then
        echo "[CI-MONITOR] IN PROGRESS: PR #${PR_NUMBER} has ${PENDING_COUNT} pending check(s), ${PASS_COUNT} passed."
        echo "[CI-MONITOR] To wait for completion: gh pr checks ${PR_NUMBER} --watch"
    else
        echo "[CI-MONITOR] PASSED: All CI checks passed for PR #${PR_NUMBER} (${PASS_COUNT} checks)."
        echo "[CI-MONITOR] PR #${PR_NUMBER} is ready to merge."
    fi
}

# --- Entry Point ---
# Non-blocking: always exit 0
main || {
    log_warn "CI monitor encountered an error, but continuing (non-blocking)."
    exit 0
}
