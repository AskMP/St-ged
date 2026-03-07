#!/usr/bin/env bash
# ==============================================================================
# _resolve-node-path — Ensures Node.js is on PATH for non-interactive shells
# ==============================================================================
#
# SOURCE this file, do not execute it directly:
#   source "$(dirname "$0")/_resolve-node-path.sh"
#
# Non-interactive shells (how Claude Code runs hooks) don't source
# ~/.bashrc or ~/.zshrc, so version managers (nvm, fnm, volta, asdf, mise)
# may not be loaded. This helper resolves the correct Node version from
# .nvmrc if present, falling back to the most recent installed version.
#
# Currently supports: nvm
# To add fnm:  eval "$(fnm env)" 2>/dev/null
# To add volta: export PATH="$HOME/.volta/bin:$PATH"
# To add asdf:  source "$HOME/.asdf/asdf.sh" 2>/dev/null
# To add mise:  eval "$(mise activate bash)" 2>/dev/null
# ==============================================================================

if ! command -v node &>/dev/null; then
  _NVMRC_VERSION=""
  if [ -f ".nvmrc" ]; then
    _NVMRC_VERSION=$(tr -d '[:space:]' < .nvmrc)
  fi

  if [ -n "$_NVMRC_VERSION" ]; then
    _MATCHED_DIR=$(ls -d "$HOME/.nvm/versions/node"/v${_NVMRC_VERSION}*/bin 2>/dev/null | sort -V | tail -1)
    if [ -n "$_MATCHED_DIR" ]; then
      export PATH="$_MATCHED_DIR:$PATH"
    fi
  else
    _LATEST_DIR=$(ls -d "$HOME/.nvm/versions/node"/v*/bin 2>/dev/null | sort -V | tail -1)
    if [ -n "$_LATEST_DIR" ]; then
      export PATH="$_LATEST_DIR:$PATH"
    fi
  fi

  unset _NVMRC_VERSION _MATCHED_DIR _LATEST_DIR
fi
