---
name: "context-engineering"
description: "Optimize context window usage for maximum effectiveness"
auto_invoke: true
triggers: ["context window is filling up", "working with large codebases", "multi-file operations", "long-running agent sessions"]
---

# Context Engineering

## Instructions

### 1. Context Hierarchy

| Priority | Content | Strategy |
|----------|---------|----------|
| P0 — Critical | Current task goal, active constraints, error state | Always retain in full |
| P1 — Active | Files being edited, current test output, active plan step | Retain until step completes |
| P2 — Reference | API signatures, type definitions, related code | Summarize after first use |
| P3 — Background | Project structure, style guides, completed steps | Compress to key facts |

### 2. Summarization Protocol

When context grows large, apply progressive summarization:

1. **Extract** — Pull out key facts, decisions, constraints
2. **Compress** — Replace verbose content with structured summaries
3. **Anchor** — Keep file paths, line numbers, exact identifiers intact
4. **Prune** — Remove completed steps with no downstream dependencies

Format summaries as: Decision, Key Facts (bulleted), Open Items, References (file paths/line numbers).

### 3. Artifact Management

- **On creation**: Store full artifact
- **On handoff**: Pass full artifact to consuming agent
- **After handoff**: Compress to summary with key references
- **On error**: Restore relevant sections from summary

### 4. File Context Strategy

- Read only sections relevant to current task
- Use line ranges for large files
- Cache type signatures and function headers, not full implementations
- Track file modification state

### 5. Multi-Agent Context

- Each agent receives only the context it needs
- Shared context passed via structured artifacts, not raw dumps
- Agent outputs summarized before passing to next stage
- Error context includes only failing step plus immediate dependencies

### 6. Practical Rules

- Use subagents for exploratory work (search, multi-file reads, web research)
- `/compact` when conversation gets long; `/clear` when switching to unrelated work
- `Read` with `offset`/`limit` for files >500 lines; `Grep` to find line numbers first (enforced by `large-file-guard.sh`)
- Prefer `model: haiku` for simple subagent tasks
- When context >75%, compact or start new session
- Check known-errors.md before investigating — recurring errors have known fixes
- Ralph mode: prefer context rotation over compression; write learnings to progress.md first

### 7. Context Rotation (Ralph Mode)

- **< 60% (green)**: Work freely, full pipeline execution
- **60–80% (yellow)**: Wrap up current task, commit, prepare progress notes
- **> 80% (red)**: Forced wrap-up — commit everything, append learnings to progress.md

Standard mode compresses and continues; Ralph mode commits + writes learnings + rotates to fresh window. Persistence between rotations: git history, progress.md, guardrails.md, PRD checkboxes.

### 8. Session Manifest

`log-edits.sh` hook creates `.claude/session-manifest.log` tracking every file modified. Use for: quick reference, populating task notes, generating diff summaries.
