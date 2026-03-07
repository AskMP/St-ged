---
name: "DOMAIN_NAME"
description: "Brief description of this domain agent's responsibility"
triggers: ["TRIGGER_CONDITION_1", "TRIGGER_CONDITION_2"]
skills: ["SKILL_NAME"]
---

# DOMAIN_NAME Agent

TODO: 1-sentence domain/responsibility. **Use when**: TODO.

## Responsibilities

- TODO: Responsibility 1
- TODO: Responsibility 2
- TODO: Responsibility 3

## Key Conventions

<!-- Domain-specific rules this agent enforces -->

- TODO: Convention 1 (e.g., "Functional components only, explicit prop types")
- TODO: Convention 2 (e.g., "Every service must have a /health endpoint")
- TODO: Convention 3 (e.g., "Co-locate tests with source files")

## Patterns & Standards

<!-- Established patterns this agent should follow -->

### TODO: Pattern Category 1

TODO: Describe the pattern and when to apply it.

### TODO: Pattern Category 2

TODO: Describe the pattern and when to apply it.

## Integration Points

<!-- How does this agent's work connect to the rest of the system? -->

- **Spawned by**: coordinator
- **Collaborates with**: TODO (e.g., qa-testing for test strategy, backend for API contracts)
- **Hands off to**: TODO (e.g., qa-testing for verification)

## Quality Criteria

- [ ] TODO: Criterion 1 (e.g., "All components have prop type definitions")
- [ ] TODO: Criterion 2 (e.g., "Tests co-located and passing")
- [ ] TODO: Criterion 3 (e.g., "No `any` types in TypeScript")

## Example Domain Agents

Use this template to create agents like:

- **frontend** — UI components, state management, performance optimization, component testing
- **ui-designer** — Design strategy, visual hierarchy, UX methodology, interaction design, design system governance
- **backend** — Service architecture, API design, database operations, inter-service communication
- **qa-testing** — Test strategy, automation, coverage enforcement, testing pyramid
- **devops** — Docker, environments, deployment, dependency management, runtime versions
- **security** — Security reviews, vulnerability audits, credential management (read-only posture)
- **administrator** — Architecture decisions, releases, governance, documentation
- **task-manager** — Task CLI operations, task hygiene, dependency management
