#!/usr/bin/env bash
# ralph-progress — Logs test/build/lint pass/fail to Ralph activity log. Exit 0 always.
# See _template-hook.sh for conventions.

set -euo pipefail

# --- Configuration ---
RALPH_DIR=".claude/ralph"
ACTIVITY_LOG="${RALPH_DIR}/activity.log"

# --- Helper Functions ---
log_activity() {
    local timestamp
    timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo "[${timestamp}] $*" >> "${ACTIVITY_LOG}"
}

# --- Main Logic ---
main() {
    # Only proceed if ralph directory exists (Ralph mode is active)
    if [[ ! -d "${RALPH_DIR}" ]]; then
        return 0
    fi

    # Read the tool input from stdin (Claude hooks receive JSON on stdin)
    local input
    input="$(cat)"

    # Extract the command that was executed
    local command
    command="$(echo "${input}" | grep -oP '"command"\s*:\s*"([^"]*)"' | head -1 | sed 's/.*: *"//;s/"$//' 2>/dev/null || echo "")"

    # If we couldn't extract a command, try simpler parsing
    if [[ -z "${command}" ]]; then
        command="$(echo "${input}" | tr ',' '\n' | grep '"command"' | head -1 | sed 's/.*"command"[^"]*"//;s/".*//' 2>/dev/null || echo "")"
    fi

    if [[ -z "${command}" ]]; then
        return 0
    fi

    # Extract exit code from tool result
    local exit_code
    exit_code="$(echo "${input}" | grep -oP '"exit_code"\s*:\s*(\d+)' | head -1 | sed 's/.*: *//' 2>/dev/null || echo "")"

    # Detect test commands
    if echo "${command}" | grep -qiE '(npm test|npx vitest|npx jest|pytest|go test|cargo test|ruby.*test|rspec|mocha|vitest|jest)'; then
        if [[ "${exit_code}" == "0" ]]; then
            log_activity "type=test command=\"${command}\" status=pass"
        else
            log_activity "type=test command=\"${command}\" status=fail exit_code=${exit_code}"
        fi
        return 0
    fi

    # Detect build commands
    if echo "${command}" | grep -qiE '(npm run build|npx tsc|cargo build|go build|make build|gradle build|mvn compile)'; then
        if [[ "${exit_code}" == "0" ]]; then
            log_activity "type=build command=\"${command}\" status=pass"
        else
            log_activity "type=build command=\"${command}\" status=fail exit_code=${exit_code}"
        fi
        return 0
    fi

    # Detect lint commands
    if echo "${command}" | grep -qiE '(eslint|prettier|pylint|flake8|golangci-lint|clippy|rubocop)'; then
        if [[ "${exit_code}" == "0" ]]; then
            log_activity "type=lint command=\"${command}\" status=pass"
        else
            log_activity "type=lint command=\"${command}\" status=fail exit_code=${exit_code}"
        fi
        return 0
    fi
}

# --- Entry Point ---
# Non-blocking: always exit 0
main "$@" || {
    exit 0
}
