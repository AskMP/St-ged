---
name: "code-review-audit"
description: "Zero-Redundancy architecture audit with governance compliance verification"
agent: "coordinator"
---

# /code-review-audit

```
/code-review-audit [--phase <phase-range>] [--governance-only]
```

Comprehensive post-build audit combining architectural integrity, agent-bloat detection, and governance compliance verification. Governance: Standard+ (Rule S4, S6).

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| --phase | no | all | Scope audit to specific PRD phases (e.g., `9-14`) |
| --governance-only | no | false | Skip architecture audit, only verify governance compliance |

---

## Role & Objective

You are a Senior Systems Architect performing a rigorous "Zero-Redundancy" audit with governance compliance verification. Your goal is to identify and resolve technical debt, architectural drift, "agent-bloat" (redundant code created by previous automated interventions), and governance rule violations introduced during PRD phase execution.

This audit uses the review label system from the agent-governance skill. Every finding is classified:

| Label | Meaning | Action Required |
|-------|---------|-----------------|
| `[block]` | Must fix -- architectural risk, broken contract, or governance violation that impacts correctness | Immediate fix required |
| `[warn]` | Should fix -- technical debt, drift, or governance gap that degrades maintainability | Fix before next phase |
| `[nit]` | Style or preference -- cosmetic issue, minor inconsistency | Optional |
| `[question]` | Needs investigation -- suspicious pattern that may or may not be a problem | Evidence gathering required |

---

## Phase 1: Discovery & Documentation

Before modifying any code, perform a comprehensive scan of the repository. For every issue found, append an entry to a file named `CODE_REVIEW_YYYY-MM-DD.md` (use the current date) in the project root.

Each entry must follow this format:

```markdown
### [LABEL] File: `path/to/file.ts`

**Category**: [e.g., Redundancy, Type Drift, Ghost Page, Governance: S1, Governance: M4]
**Severity**: block | warn | nit | question
**Confidence**: High | Medium | Low
**Description**: [What is wrong and why it is suboptimal]
**Evidence**: [What you observed -- file contents, line counts, import traces, test output]
**Proposed Fix**: [What you intend to change]
**Governance Rule**: [If applicable -- e.g., S1 (LOC threshold), S5 (domain purity), M4 (ASCII punctuation)]
```

The confidence level and evidence fields follow the agent-governance skill's agent identity norms -- no finding should be proposed without evidence, and the auditor must state how confident they are in the diagnosis.

---

## Phase 2: Audit Checklist

Review the codebase for the following categories. Use `/evidence-gather` methodology for any `[question]`-level findings before escalating to `[warn]` or `[block]`.

### A. Architecture & Redundancy

1. **Functional Redundancy**: Identify duplicate or near-duplicate functions. Look for logic that performs the same task under different names. Merge into a single, authoritative utility. This is the code-level equivalent of governance Anti-Pattern #1 (redundant enforcement) -- logic should be defined once.

2. **Orphaned Assets & Ghost Pages**: Identify pages, components, or routes that exist in the directory but are never imported, linked, or referenced in the main navigation or routing configuration. Trace the import chain from the app entry point to every component -- if the chain is broken, the asset is orphaned.

3. **Contextual Drift**: Look for "hallucinated" dependencies -- imports that don't resolve to installed packages or calls to APIs that are not part of the current project version.

4. **Ghost Completions**: Check the task log (`{{cmd:list_all}}`) against the actual codebase. If a task is marked "Complete" but the corresponding logic is missing, commented out, or not wired into the app, flag it as `[block]`. A component that passes tests but isn't reachable from the app entry point is not done.

### B. Type Safety & Contracts

5. **Type Erosion**: Identify attributes or variables using `any`, `unknown`, or non-descriptive types that were likely used to bypass linting. Replace with strict, accurate types. Type safety is non-negotiable at all governance tiers -- this is a `[block]` finding.

6. **Schema & Type Duplication**: Search for redundant type definitions or interfaces that mirror existing ones. Consolidate into a centralized `types/` or `shared/` directory per the project's domain purity conventions (governance rule S5).

7. **Contract Drift** (Governance S8): Verify that generated types (ORM client types, API response schemas, GraphQL types) match their source definitions. Regenerate and check for uncommitted type changes. If generated types differ from committed types, flag as `[block]`.

8. **Strict Prop Typing** (TypeScript/React projects): Verify all component props have explicit TypeScript interfaces -- no inline `{ [key: string]: any }` or untyped spread props. Every component's contract should be readable from its type signature alone.

### C. Testing & Coverage

9. **Test Inflation**: Audit the test suite. Flag and remove "vanity tests" that check trivialities (like constant assignments or `expect(true).toBe(true)`) purely to inflate coverage scores without testing logic or edge cases. The coverage target must be earned through meaningful tests.

10. **Coverage Consistency** (Governance S7): Verify the project's `{{coverage_target}}` coverage target is applied uniformly. No module should have a custom lower threshold. Run the coverage command and check for modules significantly below the project target.

11. **Integration Wiring**: For every feature built in the audited phases, verify at least one test exercises real wiring (component rendered via router, API hit via test client, real service calls). If all tests for a feature use mocks, flag as `[warn]` -- mock-verified is not app-verified.

### D. Code Quality & Standards

12. **File Size** (Governance S1): Scan all source files (excluding tests, generated files, configs). Any file exceeding {{loc_file_threshold}} lines is a `[warn]`. Propose extraction points for logical subsections.

13. **ASCII Punctuation** (Governance M4): Scan for smart quotes, em-dashes, en-dashes, curly apostrophes, and other non-ASCII punctuation in source files, comments, and documentation. Flag as `[nit]` with specific line numbers.

14. **Thin Main Module** (Governance M5): Verify the main entry point contains only routing and bootstrap logic -- no business logic, no direct database queries, no complex conditionals. If the entry point has grown beyond its role, flag as `[warn]`.

15. **Documentation Debt**: Identify exported functions, complex logic blocks, or custom types that lack JSDoc/TSDoc comments. Documentation should explain **why** the code exists, not just what it does. Missing docs on internal-only helpers are `[nit]`; missing docs on exported APIs are `[warn]`.

### E. Domain Purity & Architecture (Governance S5)

16. **Cross-Layer Imports**: Verify strict layer separation per the project structure. Frontend code must not import server modules (except shared types). Server code must not import frontend code. Database queries must stay in the data layer -- never in route handlers or components. Any cross-layer import is a `[block]` finding.

17. **Configuration Purity**: Verify configuration values come from config files or environment variables -- never hardcoded in source. Magic numbers, hardcoded URLs, or inline config objects are `[warn]`.

18. **Shared Type Authority**: All types used across layers must be defined in a shared location. If a type is duplicated across layers, consolidate and re-export.

### F. Commit & Task Hygiene

19. **Commit Message Format** (Governance S9): Scan recent commits for conventional commit format compliance: `type(scope): description` in imperative mood. Flag non-compliant messages as `[nit]`.

20. **Task Completion Integrity**: Cross-reference task status with actual implementation using `{{cmd:list_all}}`. For each closed task, verify the acceptance criteria are met in the codebase. For each open task, verify it isn't accidentally implemented but not closed.

### G. Catch-All

21. **Bad Smells**: Remain vigilant for any other anti-patterns not explicitly listed:
    - Unused dependencies in package manifest
    - Dead environment variables
    - Commented-out code blocks (> 5 lines)
    - TODO/FIXME/HACK comments without associated tasks
    - Console.log/print statements left in production code paths
    - Hardcoded test data that should be fixtures
    - Promise chains that should be async/await (JS/TS projects)
    - Error handling that swallows errors silently

---

## Phase 3: Execution

Only after the `CODE_REVIEW_YYYY-MM-DD.md` file has been populated and saved may you proceed with corrections.

### Execution Rules

1. **Every correction must strictly align with the "Proposed Fix" documented in the report.** No drive-by fixes. No "while I'm here" improvements.

2. **Fix order**: `[block]` findings first, then `[warn]`, then `[nit]`. Stop after `[warn]` if the change count approaches the {{loc_pr_threshold}}-line PR governance limit (S2).

3. **Evidence before action**: For any `[question]`-level finding, run `/evidence-gather` to classify confidence before proposing a fix. Do not fix uncertain findings without evidence.

4. **Test after every fix group**: After fixing each category (A through G), run `{{type_check_command}}` and the project test command to verify no regressions. Do not proceed to the next category if tests fail.

5. **LOC discipline**: If a fix would push a file over {{loc_file_threshold}} lines, extract a subsection in the same commit. Do not create files that violate governance rule S1 while fixing other issues.

6. **Update the report**: After each fix, update the corresponding entry in `CODE_REVIEW_YYYY-MM-DD.md` with the actual change made and the verification result.

### Output

When complete, append a summary section to the review file:

```markdown
## Audit Summary

**Date**: YYYY-MM-DD
**Scope**: [phases audited or "full"]
**Governance Tier**: {{governance_tier}}

### Findings by Severity

| Severity | Count | Fixed | Deferred | Notes |
|----------|-------|-------|----------|-------|
| [block] | X | X | 0 | All blocks must be resolved |
| [warn] | X | X | X | Deferred items need tasks |
| [nit] | X | X | X | Optional |
| [question] | X | X | X | Resolved via evidence gathering |

### Governance Compliance

| Rule | Status | Notes |
|------|--------|-------|
| M1 (Permission deny-list) | Pass/Fail | |
| M3 (Branch naming) | Pass/Fail | |
| M4 (ASCII punctuation) | Pass/Fail | X violations found and fixed |
| M5 (Thin main module) | Pass/Fail | |
| S1 (File LOC < {{loc_file_threshold}}) | Pass/Fail | X files over threshold |
| S5 (Domain purity) | Pass/Fail | X cross-layer imports found |
| S7 (Coverage consistency) | Pass/Fail | Coverage: X% |
| S8 (Contract drift) | Pass/Fail | |
| S9 (Commit messages) | Pass/Fail | |

### Deferred Items

[List any [warn] or [nit] items not fixed in this pass, with task IDs if created]
```

Create a task for any deferred `[warn]` finding:

```
{{cmd:create_task}} with title "Fix: [short title]" and description "CODE_REVIEW: [description of deferred finding]"
```
