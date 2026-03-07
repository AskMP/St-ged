---
task: "PRD_TITLE"
branch: "BRANCH_PREFIX-PRD_ID/description"
test_command: "npm test"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "NEXT_PRD_ID or null"
requires: ["DEPENDENCY_PRD_IDS"]
parallel_safe: false
group: 0
manifest_id: "PRD_ID"
---

# PRD: PRD_TITLE

## Context for Agent

<!-- Everything an agent needs to execute this PRD without any prior context. -->

### What This PRD Does

<!-- 2-3 sentence description of the deliverable. -->

TODO: Describe what this PRD builds.

### What Was Built Before This

<!-- List prerequisite PRDs and their key outputs so the agent knows what exists. -->

| PRD | Key Output | Files |
|-----|-----------|-------|
| TODO | TODO | TODO |

### Key Files to Read First

<!-- Files the agent should read before starting any task. -->

- `CLAUDE.md` -- project conventions and commands
- TODO: Add key files from prerequisite PRDs

### Patterns to Follow

<!-- Concrete code patterns matching this project's tech stack. Copy actual examples from the codebase. -->

```
TODO: Add actual code patterns from the project
```

### Skills and Commands

| Action | Command / Skill |
|--------|----------------|
| Run tests | `npm test` |
| Set task in progress | `{{cmd:set_status}}` |
| Close task | `{{cmd:close_task}}` |
| Append notes | `{{cmd:append_notes}}` |

---

## Problem-Solving Protocol

1. **Try the task as specified** -- follow the Do field exactly
2. **If blocked**: check guardrails.md, check prerequisite PRD outputs, verify key files exist
3. **If a new task is needed**: add it to the Discovered Tasks section below with full atomic detail, insert before the blocked task
4. **If unresolvable after 3 attempts**: add guardrail, skip to next task, log in progress.md

---

## Tasks

<!-- Checkbox list that Ralph tracks. Each item = one atomic iteration.
     IMPORTANT: All BD tasks are created in batch BEFORE any implementation begins.
     Task IDs are embedded inline so iterations never need to search/create tasks.
     Each step must be self-contained: an agent reading ONLY that step's description
     should know exactly what to do, which files to touch, and how to verify.

     TYPE SELECTION GUIDE:
     - feature: New user-facing functionality or capability (maps to {{cmd:create_feature}})
     - bug: Fix for broken behavior or regression (maps to {{cmd:create_bug}})
     - task: Setup, configuration, refactoring, infrastructure work (maps to {{cmd:create_task}})
     - chore: Maintenance, dependency updates, CI/CD, documentation (maps to {{cmd:create_task}})

     DO FIELD REQUIREMENTS:
     The Do field must contain concrete, atomic implementation details:
     - Exact function signatures: `export async function createUser(data: CreateUserInput): Promise<User>`
     - Exact file paths: `src/lib/auth.ts`, NOT "the auth file"
     - Exact behavior: "Return 409 Conflict when email already exists", NOT "handle errors"
     - Exact config values: `bcrypt cost factor 12`, NOT "use secure hashing"
     If an agent cannot implement the task from the Do field alone, it is too vague. -->

- [ ] **Task 1: Title** `[BD:PREFIX-ID]`
  - **Type**: feature | bug | task | chore
  - **Do**: Exactly what to implement -- include function signatures, file paths, behavior descriptions
  - **Files**: `path/to/file1.ts`, `path/to/file2.ts`
  - **Verify**: Command or check to confirm completion
  - **Accept**: Measurable acceptance criteria

- [ ] **Task 2: Title** `[BD:PREFIX-ID]`
  - **Type**: feature | bug | task | chore
  - **Do**: Exactly what to implement -- include function signatures, file paths, behavior descriptions
  - **Files**: `path/to/file.ts`
  - **Verify**: Command or check to confirm completion
  - **Accept**: Measurable acceptance criteria

- [ ] **Task N: Update manifest** `[BD:PREFIX-ID]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `MANIFEST_ID`. Change `status: pending` to `status: complete`. Update the Current State section: set "Last completed PRD" to `MANIFEST_ID`, update timestamp, increment progress counter. If `chain_next` is set, confirm the next PRD's `requires` are now all satisfied.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "MANIFEST_ID" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest registry updated, progress counter incremented, next PRD unblocked if applicable

---

## Discovered Tasks

<!-- Tasks discovered during execution that weren't in the original plan.
     Add them here with full atomic detail. Insert references to them
     in the Tasks section above (before the blocked task) when needed. -->

_None yet._
