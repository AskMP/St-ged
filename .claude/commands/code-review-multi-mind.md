---
name: "code-review-multi-mind"
description: "Four-persona code review with deduplication and conflict synthesis"
agent: "coordinator"
---

# /code-review-multi-mind

```
/code-review-multi-mind [<branch-or-pr>]
```

Four specialist personas review a diff independently, then findings are deduplicated and synthesized. Governance: Full (Rule F1).

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| branch-or-pr | no | current branch vs. main | Branch name, PR number, or commit range to review |

## Behavior

### 1. Gather the Diff

- If a PR number is given: `gh pr diff <number>`
- If a branch is given: `git diff main...<branch>`
- If nothing is given: `git diff main...HEAD`

### 2. Independent Persona Reviews

Each persona reviews the full diff through their lens. Personas do not see each other's findings.

#### Persona A: Correctness
- Logic errors, off-by-one, null handling, edge cases
- Type mismatches, incorrect API usage
- Missing error handling, unhandled promise rejections
- Race conditions, concurrency issues

#### Persona B: Security
- Input validation, injection vectors (SQL, XSS, command)
- Authentication and authorization gaps
- Secrets exposure, insecure defaults
- OWASP Top 10 relevance

#### Persona C: Performance
- N+1 queries, unbounded loops, missing pagination
- Memory leaks, large allocations
- Missing caching opportunities
- Bundle size impact (frontend)

#### Persona D: Maintainability
- Code clarity, naming, documentation
- Duplication, extraction opportunities
- Test coverage gaps
- Consistency with project conventions

### 3. Label Each Finding

Every finding uses a review label:

| Label | Meaning | Merge Impact |
|-------|---------|-------------|
| `[block]` | Must fix before merge | Blocks merge |
| `[warn]` | Should fix, not a blocker | Recommended |
| `[nit]` | Style preference | Optional |
| `[question]` | Needs clarification | Response needed |

### 4. Deduplicate and Synthesize

After all four reviews:

1. **Merge duplicates**: If two personas flag the same issue, keep the higher-severity label
2. **Identify conflicts**: If personas disagree (e.g., Performance says "cache this" but Maintainability says "keep it simple"), flag as a conflict for human decision
3. **Produce unified report**

### 5. Output

```markdown
## Multi-Mind Code Review

**Diff**: <branch/PR/range>
**Date**: <date>

### Summary

- **Blocks**: <count>
- **Warnings**: <count>
- **Nits**: <count>
- **Questions**: <count>

### Findings

| # | Label | Persona | File:Line | Finding | Suggestion |
|---|-------|---------|-----------|---------|------------|
| 1 | [block] | Security | src/auth.ts:42 | ... | ... |

### Conflicts (Human Decision Required)

| # | Personas | File:Line | Conflict | Options |
|---|----------|-----------|----------|---------|
| 1 | Perf vs. Maint | src/cache.ts:15 | ... | A: ... / B: ... |

### Verdict

<APPROVE / REQUEST_CHANGES / NEEDS_DISCUSSION>
```

## Examples

```
/code-review-multi-mind
/code-review-multi-mind feature/auth-refactor
/code-review-multi-mind 42
```
