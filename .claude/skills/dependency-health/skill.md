---
name: "dependency-health"
description: "Dependency auditing, vulnerability scanning, and update planning"
auto_invoke: true
triggers: ["dependency audit requested", "security vulnerability check", "dependency update planning", "new dependency being added"]
---

# Dependency Health

## Instructions

### 1. Audit Commands

Run appropriate commands for package manager: `pnpm audit` / `pip-audit` / `govulncheck ./...` / `cargo audit` for security; `pnpm outdated` / `pip list --outdated` / `go list -m -u all` / `cargo outdated` for staleness.

### 2. Vulnerability Triage

- Critical (CVSS 9.0+): update immediately, same session
- High (CVSS 7.0–8.9): update this sprint, within 1 week
- Medium (CVSS 4.0–6.9): plan update, within 1 month
- Low (CVSS < 4.0): monitor, next review

Per vulnerability: check if it affects usage, check for fix, breaking changes, and workarounds.

### 3. Update Classification

- **Security fix**: known CVE → update ASAP
- **Bug fix**: patch bump → safe, low risk
- **Feature**: minor bump → update if useful, test thoroughly
- **Breaking**: major bump → plan migration, check changelog
- **Skip**: no benefit/high risk → document why, revisit later

### 4. Generate Health Report

Include: date, package manager, dependency counts, security vulnerabilities table, recommended updates table, skipped updates with reasons, license compliance notes, prioritized action items.

### 5. New Dependency Evaluation

Check: actively maintained? (commits in last 6mo), well-tested? (CI, coverage), license compatible?, transitive dependency count, known vulnerabilities, lighter alternative?, download/usage volume.
