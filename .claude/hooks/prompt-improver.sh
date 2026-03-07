#!/usr/bin/env bash
# prompt-improver — Suggests clearer rewrites for vague user prompts. Exit 0 always (advisory).
# Non-blocking: injects hints, preserves original prompt. See _template-hook.sh for conventions.
set -uo pipefail  # DO NOT use set -e — hooks must fail gracefully

main() {
    INPUT=$(cat) || return 0

    # Extract the user's prompt text
    local PROMPT=""
    if command -v jq &>/dev/null; then
        PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty' 2>/dev/null) || true
    fi

    if [ -z "$PROMPT" ]; then
        local tmp="${INPUT#*\"prompt\"}"
        tmp="${tmp#*\"}"
        PROMPT="${tmp%%\"*}"
    fi

    [ -z "$PROMPT" ] && return 0

    # Quick heuristics: skip prompts that are already specific
    local WORD_COUNT
    WORD_COUNT=$(echo "$PROMPT" | wc -w | tr -d ' ') || return 0

    # Skip very short prompts (likely commands like "yes", "continue", "next")
    [ "$WORD_COUNT" -lt 4 ] && return 0

    # Skip prompts that start with / (slash commands)
    case "$PROMPT" in
        /*) return 0 ;;
    esac

    # Skip prompts that are already specific (contain file paths, line numbers, or code)
    case "$PROMPT" in
        *".md"*|*".ts"*|*".js"*|*".py"*|*"line "*|*"function "*|*"class "*) return 0 ;;
    esac

    # For vague prompts (short + no technical specifics), suggest improvements
    if [ "$WORD_COUNT" -lt 15 ]; then
        # Check for vague patterns
        case "$PROMPT" in
            *"fix"*|*"update"*|*"change"*|*"improve"*|*"make"*|*"do"*)
                echo "PROMPT REFINEMENT HINT: The prompt is brief. Before proceeding, consider asking the user to clarify:"
                echo "  - What specific file(s) or component(s) should be changed?"
                echo "  - What is the expected behavior vs. current behavior?"
                echo "  - Are there any constraints or preferences?"
                ;;
        esac
    fi

    return 0
}

main 2>/dev/null || true
exit 0
