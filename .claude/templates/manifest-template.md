---
task: "Build {{PROJECT_NAME}}"
branch: "{{BRANCH_PREFIX}}"
test_command: "npm test"
completion_promise: "COMPLETE"
max_iterations: 100
---

# {{PROJECT_NAME}} -- PRD Manifest

**Repository**: `{{PROJECT_NAME}}`

---

## Current State

| Field | Value |
|-------|-------|
| Last completed PRD | -- |
| Timestamp | -- |
| Current phase | 0 (Foundation) |
| Progress | 0 / {{TOTAL_PRD_COUNT}} PRDs complete |

---

## How This System Works

This manifest coordinates a multi-PRD build. Each PRD is a self-contained unit of work that an agent can execute independently -- no prior context required.

### Starting / Resuming

1. Read this manifest
2. Find the first `status: pending` entry in the PRD Registry whose `requires` are all `status: complete`
3. Open that PRD file and execute its tasks sequentially
4. The final task in every PRD updates this manifest (marks the entry `status: complete`)
5. Return to step 2

### Reference Table

| Action | Command / Skill |
|--------|----------------|
| Execute next PRD | `/ralph prd-phases/manifest.md` |
| Execute specific PRD | `/ralph prd-phases/<group>/<file>.md` |
| Generate new PRD | `/prd-generate --manifest` |
| Check progress | Read this manifest's Current State + PRD Registry |
| Create tracked tasks | Per-phase setup in `/prd-ralph` |

### Problem-Solving Protocol

When a task fails or a blocker is discovered:

1. **Try 3 times** with different approaches
2. **Add a guardrail** to `.claude/ralph/guardrails.md` documenting the failure
3. **If the blocker requires new work**: create a Discovered Tasks section in the current PRD with new atomic tasks inserted before the blocked task
4. **If the blocker requires a new PRD**: add a new entry to this manifest's PRD Registry with `status: pending` and appropriate `requires` dependencies, then create the PRD file following the standard template
5. **If unresolvable**: mark the current PRD `status: blocked` in the registry, note the reason, and move to the next eligible PRD

### Parallel Execution Rules

PRDs with `parallel_safe: true` and all `requires` satisfied may be executed concurrently by independent agents. Rules:

- Never run two PRDs that modify the same files simultaneously
- Each parallel agent gets its own branch: `{{BRANCH_PREFIX}}-<prd_id>`
- Merge sequentially in registry order after completion
- If a merge conflict arises, the later PRD resolves it

### Dynamic PRD Creation Rules

New PRDs may be added to the registry during execution when:

- A task discovers prerequisite work not covered by existing PRDs
- A feature requires more decomposition than originally planned
- A verification PRD identifies regressions requiring fix PRDs

New PRDs must: follow `prd-multi-template.md` format, have a unique manifest_id, be registered in this manifest with correct `requires` and `group`, and include the standard manifest-update final task.

---

## PRD Registry

### Group 0: Foundation

<!-- Foundation PRDs -- deterministic from scaffold Q&A. Always present. -->

<!-- Entry format:
- [ ] **PRD_ID** | `prd-phases/GROUP_DIR/FILENAME.md` | Description | status: pending | requires: none |
-->

{{FOUNDATION_REGISTRY_ENTRIES}}

### Group 1: MVP (Must Have)

<!-- One PRD per Must Have feature from the project brief. -->

{{MVP_REGISTRY_ENTRIES}}

### Group 2: Launch (Should Have)

<!-- One PRD per Should Have feature. -->

{{LAUNCH_REGISTRY_ENTRIES}}

### Group 3: Traction (Could Have)

<!-- One PRD per Could Have feature. -->

{{TRACTION_REGISTRY_ENTRIES}}

---

## PRD File Contract

Every PRD file in this system MUST include:

1. **YAML frontmatter** with: `task`, `branch`, `test_command`, `completion_promise`, `max_iterations`, `chain_next`, `requires`, `parallel_safe`, `group`, `manifest_id`
2. **Context for Agent** section: what this PRD does, what was built before, key files to read, patterns to follow, skills/commands reference
3. **Tasks** section: atomic tasks with BD IDs, Type/Do/Files/Verify/Accept fields
4. **Final task**: "Update manifest" -- marks this PRD complete in the manifest registry
5. **Discovered Tasks** section (initially empty): for work discovered during execution

---

## Standard PRD Template

See `templates/prd-multi-template.md` for the canonical template used to generate all PRD files in this system.

---

## Totals

| Metric | Count |
|--------|-------|
| Total PRDs | {{TOTAL_PRD_COUNT}} |
| Foundation (Group 0) | {{GROUP_0_COUNT}} |
| MVP (Group 1) | {{GROUP_1_COUNT}} |
| Launch (Group 2) | {{GROUP_2_COUNT}} |
| Traction (Group 3) | {{GROUP_3_COUNT}} |
| Complete | 0 |
| Pending | {{TOTAL_PRD_COUNT}} |
| Blocked | 0 |
