---
name: "session-reflect"
description: "Analyze session artifacts and propose CLAUDE.md improvements"
agent: "coordinator"
---

# /session-reflect

Analyze session artifacts (git history, task notes, known-errors.md) → propose targeted CLAUDE.md improvements. Reads from existing artifacts only (git commits, task notes, known-errors.md) — no separate diary.

```
/session-reflect [--since "3 days ago"] [--dry-run]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `--since` | no | How far back to analyze (default: "1 week ago") |
| `--dry-run` | no | Show proposals without applying |

## Workflow

1. **Gather evidence** from last N sessions (default: recent history):

   ```bash
   git log --oneline --since="1 week ago" -30
   {{cmd:list_all}}
   cat .claude/known-errors.md
   cat CLAUDE.md
   ```

2. **Analyze for patterns**: rule violations, undocumented conventions, stale rules, TODO placeholders with real values, recurring errors preventable by rule, vague rules needing concrete examples

3. **Propose changes** — per proposal: Section, Type (Add/Update/Remove/Strengthen), Current text, Proposed text, Evidence (artifact citations)

4. **Apply with confirmation**: present all proposals, apply only user-approved ones via Edit tool.

## Constraints

- Does NOT modify CLAUDE.md without user approval
- Does NOT add speculative rules — every proposal must cite artifact evidence
- Does NOT restructure entire file — targeted, minimal changes only

## Quality Gate

Every proposal must cite specific evidence. No speculative additions. Changes minimal and targeted. User approval required before modification.
