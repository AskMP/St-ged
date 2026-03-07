---
name: "investigate"
description: "Launch structured bug investigation"
agent: "debugger"
---

# /investigate

```
/investigate <description> [--task <task-id>]
```

Reproduction-first bug investigation. Create task, reproduce, write failing test, document findings, propose solutions.

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| description | yes | — | Bug / unexpected behavior description |
| --task | no | auto-create | Link to existing task instead of creating new one |

## Behavior

1. **Create task** (if not provided) — run `{{cmd:create_bug}}` with title `Bug: <title from description>`:

   ```markdown
   ## Problem
   <description>

   ## Acceptance Criteria
   - [ ] Bug reproduced with failing test
   - [ ] Root cause identified
   - [ ] Fix implemented and verified
   - [ ] Tests pass
   ```

2. **Attempt reproduction** — trigger bug, capture evidence. Cannot reproduce → document, ask for more info.
3. **Write failing test** — confirm it fails (proves bug exists). Becomes verification gate for fix.
4. **Investigation checklist**: Reproducible? Failing test? Fixed before (search history)? Known upstream? Recent changes (`git log`)? Environment correct? Related log errors?
5. **Document findings** — `{{cmd:append_notes}}`: `[done] Root cause: <analysis>`, `[done] Evidence: <files and lines>`
6. **Propose solutions** — per option: approach, pros/cons, files affected, test impact. State chosen option with reasoning.

## Output

Investigation report: reproduction status (reproduced / intermittent / cannot reproduce), failing test path, root cause analysis, 2-3 solution options with trade-offs, recommended approach.
