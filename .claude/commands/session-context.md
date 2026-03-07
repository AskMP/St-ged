---
name: "session-context"
description: "Display a structured session context summary"
agent: "coordinator"
---

# /session-context — Session Context Summary

Run these commands, present results as structured status report.

## Steps

1. **Git state**: `git branch --show-current`, `git status --short`, `git log --oneline -5`, `git stash list` (if stashes exist)

2. **Task state**:
   - Run `{{cmd:list_active}}` — in-progress tasks
   - Run `{{cmd:list_ready}}` — available/ready tasks

3. **Service health** (skip if N/A): `docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null` — if unhealthy, tail 10 lines of logs

4. **Environment check**: verify runtime version matches project requirements, check `.nvmrc` / equivalent

5. **Session manifest** (if exists): `cat .claude/session-manifest.log 2>/dev/null | tail -20`

## Output Format

```
## Session Context
**Branch**: <branch>
**Uncommitted changes**: <count / "clean">
**Active tasks**: <IDs + titles>
**Services**: <running/stopped, health>
**Runtime**: <version, OK/MISMATCH>
**Recent commits**: <last 5, one-line each>
**Available work**: <ready tasks>
**Session edits**: <files modified count / "new session">
```
