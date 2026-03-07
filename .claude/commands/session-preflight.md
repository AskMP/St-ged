---
name: "session-preflight"
description: "Run full pre-commit/pre-PR verification checklist"
agent: "coordinator"
---

# /session-preflight

```
/session-preflight [--full]
```

Pre-commit/pre-PR verification. Checks tests, types, coverage, build, task state, branch status. Stop on first failure.

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| --full | no | false | Include E2E tests + security audit (slower) |

## Standard Preflight

1. **Tests**: `<test-command>` — all pass
2. **Type check**: `{{type_check_command}}` — skip if `*(skip)*`. Tests passing does NOT guarantee type safety — runners strip types.
3. **Coverage**: `<test-command> --coverage` — >= minimum threshold
4. **Build**: `<build-command>` — succeeds
5. **Task state**: `{{cmd:list_active}}` + `{{cmd:show_details}}` — active task exists, notes current
6. **Branch state**: on feature branch (not main), no unexpected changes

## Full Preflight (`--full`)

Standard plus: **Security audit** (`<audit-command>`), **E2E tests** (`<e2e-command>`)

## Verdict

All pass → "Ready to commit and push." Any fail → "NOT ready. Fix failures above first." WARN items non-blocking; if matches `known-errors.md`, reference known fix.
