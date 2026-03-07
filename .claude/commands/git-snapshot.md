---
name: "git-snapshot"
description: "Create a named git stash as a rollback point without interrupting work"
triggers: ["/git-snapshot"]
agent: "coordinator"
---

# /git-snapshot

```
/git-snapshot <description>
```

Named git stash as rollback point, then immediately restore working state. Stash preserved for later recovery.

| Argument | Required | Description |
|----------|----------|-------------|
| description | yes | Short description of state being preserved |

## Behavior

1. Check `git status --short` — no changes → "Nothing to snapshot — working tree is clean."
2. `git stash push -m "snapshot-$(date +%Y%m%d-%H%M%S): <description>"`
3. `git stash pop` — restore working state immediately
4. Confirm: "Snapshot created. Restore via `git stash list` then `git stash apply stash@{N}`"

## When to Use

- Before risky refactor or alternative approach
- At known-good state you might want to return to

## Examples

```
/git-snapshot before refactoring auth middleware
/git-snapshot working state with passing tests
```
