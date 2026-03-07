#!/usr/bin/env bash
# pre-compact-capture — Captures session summary before context compaction
# Trigger: PreCompact hook
# Purpose: Preserve key decisions and learnings before context window is compressed.
# Writes a timestamped entry to .claude/session-captures/ so /session-reflect
# can analyze accumulated session history.
# DO NOT use set -e — hooks must fail gracefully to avoid wasting tokens
set -uo pipefail

CAPTURES_DIR=".claude/session-captures"

log_info() { echo "[pre-compact-capture] $*"; }

main() {
    # Create captures directory if needed
    mkdir -p "$CAPTURES_DIR"

    TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
    CAPTURE_FILE="${CAPTURES_DIR}/capture-${TIMESTAMP}.md"

    # Gather quick context snapshot
    BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    RECENT_COMMITS=$(git log --oneline -5 2>/dev/null || echo "no commits")
    UNCOMMITTED=$(git diff --stat 2>/dev/null || echo "clean")

    cat > "$CAPTURE_FILE" << CAPTURE_EOF
# Session Capture — ${TIMESTAMP}

**Branch**: ${BRANCH}

## Recent Commits
${RECENT_COMMITS}

## Uncommitted Changes
${UNCOMMITTED}
CAPTURE_EOF

    log_info "Session snapshot saved to ${CAPTURE_FILE}"

    # Prune old captures (keep last 20)
    CAPTURE_COUNT=$(ls -1 "${CAPTURES_DIR}"/capture-*.md 2>/dev/null | wc -l | tr -d ' ')
    if [ "$CAPTURE_COUNT" -gt 20 ]; then
        ls -1t "${CAPTURES_DIR}"/capture-*.md | tail -n +21 | xargs rm -f
        log_info "Pruned old captures (kept 20 most recent)"
    fi
}

main || { echo "[pre-compact-capture] WARNING: capture failed" >&2; exit 0; }
