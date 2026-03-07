---
name: "git-diff-summary"
description: "Analyze uncommitted changes and produce structured summary for commits and task notes"
triggers: ["/git-diff-summary"]
agent: "coordinator"
---

# /git-diff-summary — Summarize Current Changes

Analyze all uncommitted changes → produce structured summary suitable for commit messages and task notes.

## Behavior

1. Run `git diff --stat` for file-level change summary
2. Run `git diff` for full diff content
3. Run `git diff --cached --stat` to include staged changes
4. Analyze changes and produce output below

## Output Format

```markdown
## Changes Summary
**Files changed**: <count>
**Insertions**: <count> | **Deletions**: <count>

### What changed:
- <file>: <one-line description of what changed and why>
- <file>: <one-line description>

### Suggested commit message:
<type>: <concise description> (<PREFIX>-<task-id>)

### Suggested task note:
[done] <description of what was accomplished>
```

**Do NOT commit or push** — just present summary for review.

