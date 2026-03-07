#!/usr/bin/env bash
# ralph-once.sh — Single Ralph iteration with human review (acceptEdits mode).
# Usage: bash .claude/scripts/ralph-once.sh [--prd PATH] [--tool claude|amp]
# See _template-hook.sh for conventions.

set -euo pipefail

# --- Configuration ---
TOOL="claude"
RALPH_DIR=".claude/ralph"
PRD_FILE="${RALPH_PRD:-PRD.md}"
COMPLETION_PROMISE="${RALPH_PROMISE:-COMPLETE}"
ACTIVITY_LOG="${RALPH_DIR}/activity.log"
PERMISSION_MODE="acceptEdits"

# Parse optional flags
while [[ $# -gt 0 ]]; do
    case "$1" in
        --tool)
            TOOL="${2:-claude}"
            shift 2
            ;;
        --prd)
            PRD_FILE="${2:-PRD.md}"
            shift 2
            ;;
        --promise)
            COMPLETION_PROMISE="${2:-COMPLETE}"
            shift 2
            ;;
        --permissions)
            PERMISSION_MODE="${2:-acceptEdits}"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

# --- Helper Functions ---
log_info() {
    echo "[ralph-once] $*"
}

log_error() {
    echo "[ralph-once] ERROR: $*" >&2
}

log_activity() {
    local timestamp
    timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo "[${timestamp}] $*" >> "${ACTIVITY_LOG}"
}

# --- Validation ---
if [[ ! -f "${PRD_FILE}" ]]; then
    log_error "PRD file not found: ${PRD_FILE}"
    log_error "Create a PRD file or set RALPH_PRD=path/to/prd.md"
    exit 1
fi

if ! command -v "${TOOL}" &>/dev/null; then
    log_error "${TOOL} CLI not found. Install it first."
    exit 1
fi

# --- Setup ---
mkdir -p "${RALPH_DIR}"

if [[ ! -f "${RALPH_DIR}/progress.md" ]]; then
    echo "# Progress Log" > "${RALPH_DIR}/progress.md"
    echo "" >> "${RALPH_DIR}/progress.md"
fi

if [[ ! -f "${RALPH_DIR}/guardrails.md" ]]; then
    echo "# Guardrails" > "${RALPH_DIR}/guardrails.md"
    echo "" >> "${RALPH_DIR}/guardrails.md"
fi

# Determine iteration number from activity log
ITERATION=1
if [[ -f "${ACTIVITY_LOG}" ]]; then
    LAST_ITERATION="$(grep -oP 'iteration=\K\d+' "${ACTIVITY_LOG}" | tail -1 2>/dev/null || echo "0")"
    ITERATION=$((LAST_ITERATION + 1))
fi

log_info "Starting single Ralph iteration (iteration ${ITERATION})"
log_info "  PRD: ${PRD_FILE}"
log_info "  Permission mode: ${PERMISSION_MODE}"
log_activity "single_iteration_start iteration=${ITERATION}"

# --- Build Prompt ---
PROMPT="Ralph single iteration ${ITERATION}.

Read @${PRD_FILE} — find the NEXT unchecked task (\`- [ ]\`). Read @${RALPH_DIR}/guardrails.md for pitfalls. Skim last entries of @${RALPH_DIR}/progress.md for recent context.

Task IDs are normally embedded inline as \`[BD:ID]\`.

Steps:
1. Extract the task's BD ID, Do, Files, Verify, and Accept fields
2. If task has no [BD:ID]: create the BD task, embed the ID in the PRD, commit the update
3. Set task in_progress using its BD ID
4. Implement exactly what the Do field says, touching only the listed Files
5. Run the Verify command — tests must pass
6. Commit changes
7. Close the BD task, check the PRD box (\`- [x]\`)
8. Append 1-2 line learning to ${RALPH_DIR}/progress.md

If you hit a ROADBLOCK requiring new work:
- Create new BD tasks with correct types
- Insert full atomic steps (Do/Files/Verify/Accept + [BD:ID]) into the PRD BEFORE the blocked task
- Commit the PRD update, then process the new tasks next iteration

If context is low: add [pause] note to BD task, commit, stop.
If ALL tasks checked: output <promise>${COMPLETION_PROMISE}</promise>

ONE task only. Commit before finishing. Report what you did and what the next task would be."

# --- Execute ---
if [[ "${TOOL}" == "claude" ]]; then
    "${TOOL}" -p "${PROMPT}" --permission-mode "${PERMISSION_MODE}"
else
    "${TOOL}" -p "${PROMPT}"
fi

log_activity "single_iteration_end iteration=${ITERATION}"
log_info ""
log_info "Iteration ${ITERATION} complete."
log_info "Review the changes, then run this script again for the next iteration."
