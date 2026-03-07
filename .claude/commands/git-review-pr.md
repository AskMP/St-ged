---
name: "git-review-pr"
description: "Structured pull request review"
triggers: ["/git-review-pr"]
agent: "coordinator"
---

# /git-review-pr

```
/git-review-pr <pr-number> [--security]
```

Fetch diff, check security checklist, verify test coverage, check task linkage → structured review comments.

## Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| pr-number | yes | — | GitHub PR number to review |
| --security | no | false | Include full security review checklist |

## Behavior

1. **Fetch PR metadata**
   ```bash
   gh pr view <number>
   gh pr diff <number>
   ```

2. **Code review** — readability, naming, patterns. No `any` types, no `console.log`. Error handling present. No performance issues. Changes match PR description.
3. **Test coverage** — new code has tests, descriptive names, edge cases covered, no flaky patterns (arbitrary waits, shared state)
4. **Task linkage** — PR references task ID, task in correct state, acceptance criteria addressed
5. **Security review** (always basic, extended with `--security`)
   - Basic: no credentials/secrets/keys, no SQL injection/XSS, no unsafe deserialization, errors don't leak internals
   - Extended: input validation, auth checks, rate limiting, dependency vulnerabilities, CORS/CSP headers

6. **Output structured review**

   ```markdown
   ## PR Review: #<number> — <title>

   ### Summary
   [Brief assessment of PR]

   ### Approval Status
   [Approve / Request Changes / Comment]

   ### Findings
   | Severity | File | Line | Issue |
   |----------|------|------|-------|
   | Block | src/auth.ts | 42 | Missing input validation |
   | Warn | src/api.ts | 88 | Console.log left in |
   | Note | src/utils.ts | 15 | Consider extracting helper |

   ### Test Coverage
   - [ ] New code has tests
   - [ ] Edge cases covered
   - [ ] No flaky patterns

   ### Security
   - [ ] No secrets in diff
   - [ ] Input validation present
   - [ ] Error messages safe

   ### Task
   - [ ] Task ID referenced
   - [ ] Acceptance criteria met
   ```

## Examples

```
/git-review-pr 123
/git-review-pr 456 --security
```
