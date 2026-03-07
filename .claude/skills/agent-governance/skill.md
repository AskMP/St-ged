---
name: "agent-governance"
description: "Canonical governance rules organized by tier (Minimal/Standard/Full)"
auto_invoke: false
triggers: ["governance enforcement", "code review standards", "agent identity"]
---

# Agent Governance

## Governance Tier: {{governance_tier}}

Type safety and tests are non-negotiable at ALL tiers. Tiers control architectural complexity, not quality floors.

---

## Rule Reference

Every rule is defined once here. Hooks, agents, and templates reference this skill -- they do not redefine rules independently.

### Minimal Tier (5 rules -- all projects)

| # | Rule | Enforcement |
|---|------|-------------|
| M1 | Permission deny-list: block `rm -rf /`, `rm -rf ~`, `chmod 777`, writes to `.env*` files | settings.json `permissions.deny` |
| M2 | Auto-format on save | `auto-format.sh` hook (PostToolUse Write\|Edit) |
| M3 | Branch naming: `<prefix>-<task-id>/<description>`, never commit to main | `check-branch.sh` hook (PreToolUse Write\|Edit) |
| M4 | ASCII punctuation in code, comments, and documentation -- no smart quotes, em-dashes, or curly apostrophes | `ascii-punctuation.sh` hook (PostToolUse Write\|Edit) |
| M5 | Thin main module -- routing and bootstrap only, no business logic in entry point | Agent instructions (AGENTS.md) |

### Standard Tier (+10 rules -- includes Minimal)

| # | Rule | Enforcement |
|---|------|-------------|
| S1 | File LOC threshold: {{loc_file_threshold}} lines per source file | `check-loc-threshold.sh` hook (PostToolUse Write\|Edit) |
| S2 | PR LOC limit: {{loc_pr_threshold}} net lines per PR | Coordinator agent review checklist |
| S3 | Agent identity: state role and confidence level (High/Medium/Low) when providing recommendations | Agent instructions (AGENTS.md) |
| S4 | Review labels: `[block]`, `[warn]`, `[nit]`, `[question]` on all code review feedback | Coordinator agent, review commands |
| S5 | Domain purity: no cross-layer imports (e.g., UI must not import from server), config from env only | Agent instructions (AGENTS.md) |
| S6 | Evidence-based debugging: hypothesize, gather evidence, classify confidence before proposing fixes | `/evidence-gather` command |
| S7 | Coverage consistency: single `{{coverage_target}}` token used everywhere, no per-module overrides | Token replacement at scaffold time |
| S8 | Contract drift prevention: commit generated types (API schemas, DB types), use `--check` mode in CI | Agent instructions (AGENTS.md) |
| S9 | Imperative commit messages: `type(scope): description` in imperative mood | `check-commit-msg.sh` hook |
| S10 | Communication standards: no filler words in agent output, direct and actionable language | Agent instructions (AGENTS.md) |

### Full Tier (+15 rules -- includes Minimal + Standard)

| # | Rule | Enforcement |
|---|------|-------------|
| F1 | Multi-mind code review: 4 specialist personas (Correctness, Security, Performance, Maintainability) | `/code-review-multi-mind` command |
| F2 | Five Whys root cause analysis: each "why" requires evidence, stops at actionable root cause | `/solve-strict` command |
| F3 | Proactive dead code removal: flag unused exports, unreachable branches, orphan files | Agent playbook (AGENTS.md) |
| F4 | Proactive README maintenance: update README when public API or setup steps change | Agent playbook (AGENTS.md) |
| F5 | Fix-main-red priority: if main branch is red, fix it before starting new work (blast radius: affected test files + direct dependencies only) | Agent playbook (AGENTS.md) |
| F6 | Frontend anti-monolith: no component file >250 lines, extract sub-components proactively | Agent instructions (AGENTS.md) |
| F7 | Glossary maintenance: maintain `docs/glossary.md` for domain terms | Agent playbook (AGENTS.md) |
| F8 | Strict feature workflow: research -> plan -> implement, no skipping phases | Agent instructions (AGENTS.md) |
| F9 | Architecture Decision Records: significant decisions documented in `docs/adr/` | Agent playbook (AGENTS.md) |
| F10 | Dependency review: new dependencies require justification (size, maintenance, alternatives considered) | Agent instructions (AGENTS.md) |
| F11 | Error budget: track test flakiness, budget 2% flake rate max | CI guidance |
| F12 | Performance baselines: document p50/p95 for critical paths, alert on regression | CI guidance |
| F13 | Security review gate: security agent review required for auth, crypto, or data handling changes | Agent spawning (coordinator) |
| F14 | API versioning discipline: breaking changes require version bump and migration guide | Agent instructions (AGENTS.md) |
| F15 | Post-mortem on production incidents: document timeline, root cause, remediation, prevention | Agent playbook (AGENTS.md) |

---

## Code Size Thresholds (Standard+)

- **File threshold**: {{loc_file_threshold}} lines per source file (non-test, non-generated)
- **PR threshold**: {{loc_pr_threshold}} net lines per pull request
- When a file exceeds the threshold, the `check-loc-threshold.sh` hook emits a non-blocking warning. Consider extracting a logical subsection.
- When a PR exceeds the threshold, the coordinator suggests splitting into smaller PRs.

---

## Agent Identity Norms (Standard+)

When providing recommendations, agents state:
- **Role**: Which agent is speaking (e.g., "As the implementer...")
- **Confidence**: High / Medium / Low
- **Basis**: What evidence supports the recommendation

---

## Review Labels (Standard+)

All code review feedback uses these labels:

| Label | Meaning | Action Required |
|-------|---------|-----------------|
| `[block]` | Must fix before merge | Yes -- PR cannot merge |
| `[warn]` | Should fix, but not a blocker | Strongly recommended |
| `[nit]` | Style or preference, take it or leave it | Optional |
| `[question]` | Reviewer needs clarification | Response required |

---

## Domain Purity Rules (Standard+)

- No cross-layer imports: UI code must not import server modules, and vice versa
- Configuration values come from environment variables or config files, never hardcoded
- Shared types live in a `shared/` or `types/` directory, imported by both layers
- Database queries stay in the data layer, never in route handlers or components

---

## Proactive Playbook (Full)

Agents at Full governance proactively address these concerns without being asked:

1. **Dead code removal**: Flag unused exports, unreachable code paths, orphan files during implementation
2. **README updates**: When public API or setup steps change, update README in the same PR
3. **Fix-main-red**: If CI is red on main, prioritize fixing it before new feature work. Blast radius limit: only touch affected test files and their direct dependencies
4. **Glossary**: When introducing domain-specific terms, add them to `docs/glossary.md`
5. **ADR creation**: When making significant architectural decisions, create an ADR in `docs/adr/`

---

## Hook Execution Reference

This table shows which hooks enforce which governance rules, preventing confusion about when checks run.

| Hook | Trigger | Matcher | Rules Enforced | Tier |
|------|---------|---------|----------------|------|
| `check-branch.sh` | PreToolUse | Write\|Edit | M3 (branch naming) | Minimal+ |
| `auto-format.sh` | PostToolUse | Write\|Edit | M2 (auto-format) | Minimal+ |
| `ascii-punctuation.sh` | PostToolUse | Write\|Edit | M4 (ASCII punctuation) | Minimal+ |
| `check-loc-threshold.sh` | PostToolUse | Write\|Edit | S1 (file LOC) | Standard+ |
| `check-commit-msg.sh` | PreToolUse | Bash | S9 (commit messages) | Standard+ |
| `check-types.sh` | PreToolUse | Bash | Type safety (all tiers) | All |
| `check-coverage.sh` | PreToolUse | Bash | S7 (coverage) | All |
| `check-tests-before-push.sh` | PreToolUse | Bash | Test gate (all tiers) | All |
| `block-dangerous-commands.sh` | PreToolUse | Bash | M1 (permission deny-list) | Minimal+ |

---

## Contract Drift Prevention (Standard+)

- Generated types (API schemas, database types, GraphQL types) must be committed to version control
- CI should run type generation in `--check` mode to detect drift
- If generated types differ from committed types, the build fails
- This prevents runtime errors from stale type definitions

---

## Communication Standards (All Tiers)

- Use ASCII punctuation in all code, comments, and documentation
- Commit messages use imperative mood: `type(scope): description`
- Types: feat, fix, chore, refactor, test, docs, style, perf, ci
- No filler words in agent output -- be direct and actionable
