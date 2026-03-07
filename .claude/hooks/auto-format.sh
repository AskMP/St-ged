#!/usr/bin/env bash
# auto-format — Auto-formats files after Write/Edit. Exit 0 always (non-blocking).
# Detects: prettier, black, gofmt, rustfmt, clang-format, shfmt. See _template-hook.sh for conventions.

set -uo pipefail

# --- Ensure Node is on PATH for non-interactive shells ---
source "$(dirname "$0")/_resolve-node-path.sh"

INPUT=$(cat)

# Extract file path (jq with grep/sed fallback)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || \
  echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# --- Extension to formatter mapping ---
case "$FILE_PATH" in
  # Prettier: JS/TS/CSS/HTML/JSON/MD/YAML
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.scss|*.less|*.html|*.md|*.yaml|*.yml|*.vue|*.svelte)
    if command -v npx &>/dev/null; then
      npx prettier --write "$FILE_PATH" 2>/dev/null || true
    elif command -v prettier &>/dev/null; then
      prettier --write "$FILE_PATH" 2>/dev/null || true
    fi
    ;;
  # Black: Python
  *.py|*.pyi)
    if command -v black &>/dev/null; then
      black --quiet "$FILE_PATH" 2>/dev/null || true
    fi
    ;;
  # gofmt: Go
  *.go)
    if command -v gofmt &>/dev/null; then
      gofmt -w "$FILE_PATH" 2>/dev/null || true
    fi
    ;;
  # rustfmt: Rust
  *.rs)
    if command -v rustfmt &>/dev/null; then
      rustfmt "$FILE_PATH" 2>/dev/null || true
    fi
    ;;
  # clang-format: C/C++
  *.c|*.cpp|*.cc|*.cxx|*.h|*.hpp)
    if command -v clang-format &>/dev/null; then
      clang-format -i "$FILE_PATH" 2>/dev/null || true
    fi
    ;;
  # shfmt: Shell
  *.sh|*.bash)
    if command -v shfmt &>/dev/null; then
      shfmt -w "$FILE_PATH" 2>/dev/null || true
    fi
    ;;
esac

exit 0
