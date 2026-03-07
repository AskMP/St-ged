#!/usr/bin/env bash
# ralph-loop.sh — AFK loop: runs Claude iterations until PRD tasks are complete.
# Usage: bash .claude/scripts/ralph-loop.sh [max_iterations] [--tool claude|amp]
# See _template-hook.sh for conventions.

set -euo pipefail

# --- Configuration ---
MAX_ITERATIONS="${1:-25}"
TOOL="claude"
RALPH_DIR=".claude/ralph"
PRD_FILE="${RALPH_PRD:-PRD.md}"
COMPLETION_PROMISE="${RALPH_PROMISE:-COMPLETE}"
ACTIVITY_LOG="${RALPH_DIR}/activity.log"
PERMISSION_MODE="${RALPH_PERMISSIONS:-plan}"

# Parse optional flags
shift 2>/dev/null || true
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
            PERMISSION_MODE="${2:-plan}"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

# --- Helper Functions ---
log_info() {
    echo "[ralph-loop] $*"
}

log_error() {
    echo "[ralph-loop] ERROR: $*" >&2
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

# Initialize progress.md if it doesn't exist
if [[ ! -f "${RALPH_DIR}/progress.md" ]]; then
    echo "# Progress Log" > "${RALPH_DIR}/progress.md"
    echo "" >> "${RALPH_DIR}/progress.md"
fi

# Initialize guardrails.md if it doesn't exist
if [[ ! -f "${RALPH_DIR}/guardrails.md" ]]; then
    echo "# Guardrails" > "${RALPH_DIR}/guardrails.md"
    echo "" >> "${RALPH_DIR}/guardrails.md"
fi

log_info "Starting Ralph loop"
log_info "  PRD: ${PRD_FILE}"
log_info "  Max iterations: ${MAX_ITERATIONS}"
log_info "  Completion promise: ${COMPLETION_PROMISE}"
log_info "  Tool: ${TOOL}"
log_info "  Permissions: ${PERMISSION_MODE}"
log_activity "loop_start max_iterations=${MAX_ITERATIONS} prd=\"${PRD_FILE}\""

# --- Main Loop ---
for i in $(seq 1 "${MAX_ITERATIONS}"); do
    log_info ""
    log_info "=== Iteration ${i}/${MAX_ITERATIONS} ==="
    log_activity "iteration_start iteration=${i}"

    # Build the prompt — kept minimal for token efficiency.
    # BD tasks are normally pre-created during per-phase setup with IDs inline as [BD:ID].
    # Iterations can create new tasks when they hit roadblocks or find missing IDs.
    PROMPT="Ralph iteration ${i}/${MAX_ITERATIONS}.

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

ONE task only. Commit before finishing."

    # Run the iteration
    OUTPUT_FILE="${RALPH_DIR}/iteration-${i}.log"

    if [[ "${TOOL}" == "claude" ]]; then
        "${TOOL}" -p "${PROMPT}" --permission-mode "${PERMISSION_MODE}" 2>&1 | tee "${OUTPUT_FILE}"
    else
        "${TOOL}" -p "${PROMPT}" 2>&1 | tee "${OUTPUT_FILE}"
    fi

    # Check for completion promise
    if grep -q "<promise>${COMPLETION_PROMISE}</promise>" "${OUTPUT_FILE}"; then
        log_info ""
        log_info "=== COMPLETE ==="
        log_info "All tasks finished after ${i} iterations."
        log_activity "loop_complete iterations=${i}"
        exit 0
    fi

    log_activity "iteration_end iteration=${i}"
    log_info "Iteration ${i} complete. Continuing..."
done

log_info ""
log_info "=== MAX ITERATIONS REACHED ==="
log_info "Completed ${MAX_ITERATIONS} iterations. Some tasks may remain."
log_activity "loop_max_reached iterations=${MAX_ITERATIONS}"
exit 0
