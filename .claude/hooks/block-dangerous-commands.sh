#!/usr/bin/env bash
# ==============================================================================
# block-dangerous-commands — Blocks destructive git operations
# ==============================================================================
#
# Trigger: PreToolUse on Bash
# Purpose: Prevents accidental data loss from destructive commands
#
# Reads tool invocation JSON from stdin.
# Exit 0 = allow
# Exit 2 = block (stderr shown as error)
#
# Blocked commands: git reset --hard, git push --force, git clean -f,
# git checkout . (restore all), git branch -D, rm -rf /, rm -rf ~,
# chmod 777, sudo rm
#
# Configuration (.claude/settings.json):
#   Add to the same PreToolUse Bash matcher as other Bash hooks.
# ==============================================================================

set -euo pipefail

# Read the tool invocation from stdin
INPUT=$(cat)

# Extract the command from tool_input
COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"command"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

# Check for dangerous patterns
check_dangerous() {
    local cmd="$1"

    # git reset --hard
    if echo "$cmd" | grep -qE 'git\s+reset\s+--hard'; then
        echo "BLOCKED: Destructive command detected: git reset --hard" >&2
        echo "  This discards all uncommitted changes permanently." >&2
        echo "  If intentional, run the command manually outside Claude Code." >&2
        return 1
    fi

    # git push --force (but not --force-with-lease which is safer)
    if echo "$cmd" | grep -qE 'git\s+push\s+.*--force' && ! echo "$cmd" | grep -qE '--force-with-lease'; then
        echo "BLOCKED: Destructive command detected: git push --force" >&2
        echo "  This rewrites remote history and can destroy others' work." >&2
        echo "  Consider using --force-with-lease instead for safety." >&2
        echo "  If intentional, run the command manually outside Claude Code." >&2
        return 1
    fi

    # git clean -f (force delete untracked files)
    if echo "$cmd" | grep -qE 'git\s+clean\s+.*-[a-zA-Z]*f'; then
        echo "BLOCKED: Destructive command detected: git clean -f" >&2
        echo "  This permanently deletes untracked files." >&2
        echo "  If intentional, run the command manually outside Claude Code." >&2
        return 1
    fi

    # git checkout . (discard all changes)
    if echo "$cmd" | grep -qE 'git\s+checkout\s+\.$'; then
        echo "BLOCKED: Destructive command detected: git checkout ." >&2
        echo "  This discards all uncommitted changes in the working directory." >&2
        echo "  If intentional, run the command manually outside Claude Code." >&2
        return 1
    fi

    # git restore . (discard all changes)
    if echo "$cmd" | grep -qE 'git\s+restore\s+\.$'; then
        echo "BLOCKED: Destructive command detected: git restore ." >&2
        echo "  This discards all uncommitted changes in the working directory." >&2
        echo "  If intentional, run the command manually outside Claude Code." >&2
        return 1
    fi

    # git branch -D (force delete branch)
    if echo "$cmd" | grep -qE 'git\s+branch\s+-D'; then
        echo "BLOCKED: Destructive command detected: git branch -D" >&2
        echo "  This force-deletes a branch even if not fully merged." >&2
        echo "  Use git branch -d (lowercase) to safely delete merged branches." >&2
        echo "  If intentional, run the command manually outside Claude Code." >&2
        return 1
    fi

    # git push -f (short form of --force)
    if echo "$cmd" | grep -qE 'git\s+push\s+-f\b' && ! echo "$cmd" | grep -qE '--force-with-lease'; then
        echo "BLOCKED: Destructive command detected: git push -f" >&2
        echo "  This rewrites remote history and can destroy others' work." >&2
        echo "  Consider using --force-with-lease instead for safety." >&2
        echo "  If intentional, run the command manually outside Claude Code." >&2
        return 1
    fi

    # rm -rf / or rm -rf ~ or rm -rf * (catastrophic deletions)
    if echo "$cmd" | grep -qE 'rm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*\s+(/|~|\*|/\*)'; then
        echo "BLOCKED: Destructive command detected: recursive force delete on root/home/all" >&2
        echo "  This can cause catastrophic, irreversible data loss." >&2
        echo "  If intentional, run the command manually outside Claude Code." >&2
        return 1
    fi
    if echo "$cmd" | grep -qE 'rm\s+-[a-zA-Z]*f[a-zA-Z]*r[a-zA-Z]*\s+(/|~|\*|/\*)'; then
        echo "BLOCKED: Destructive command detected: recursive force delete on root/home/all" >&2
        echo "  This can cause catastrophic, irreversible data loss." >&2
        echo "  If intentional, run the command manually outside Claude Code." >&2
        return 1
    fi

    # chmod 777 (overly permissive)
    if echo "$cmd" | grep -qE 'chmod\s+777'; then
        echo "BLOCKED: Insecure command detected: chmod 777" >&2
        echo "  This makes files world-readable, writable, and executable." >&2
        echo "  Use more restrictive permissions (e.g., 755 for dirs, 644 for files)." >&2
        echo "  If intentional, run the command manually outside Claude Code." >&2
        return 1
    fi

    # sudo rm (elevated destructive operation)
    if echo "$cmd" | grep -qE 'sudo\s+rm'; then
        echo "BLOCKED: Destructive command detected: sudo rm" >&2
        echo "  Elevated-privilege deletion is too dangerous for automated execution." >&2
        echo "  If intentional, run the command manually outside Claude Code." >&2
        return 1
    fi

    return 0
}

# Only check Bash commands
TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

case "$TOOL_NAME" in
  Bash) ;;
  *) exit 0 ;;
esac

if check_dangerous "$COMMAND"; then
    exit 0
else
    exit 2
fi
