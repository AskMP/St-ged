---
name: "coverage-analysis"
description: "Analyze test coverage, identify gaps, and prioritize test writing"
auto_invoke: true
triggers: ["coverage report generated", "coverage below threshold", "coverage gap analysis requested"]
---

# Coverage Analysis

## Instructions

### 1. Coverage Thresholds

- Core logic: 90%+ target, 80% critical
- UI Components: 80%+ target, 70% critical
- Utilities: 85%+ target, 75% critical
- Services: 85%+ target, 75% critical
- Overall minimum: 75% target, 70% critical

### 2. Run Coverage

Run project test runner with `--coverage` flag.

### 3. Parse Output

Extract per-file: statements %, branches %, functions %, lines %, uncovered line ranges.

### 4. Prioritize Gaps

- **P0**: Core logic below 80% (highest bug risk)
- **P1**: Recently changed files below target (untested changes → risk)
- **P2**: Services/utilities below 75% (shared code, many consumers)
- **P3**: UI components below 70% (user-facing regression risk)
- **P4**: Any file below overall minimum (compliance)

### 5. Generate Gap Report

Include: overall %, date, critical gaps table (file/current/target/uncovered lines/suggested tests), high-priority table, action items (ordered by impact), files to skip.

### 6. Identify Test Opportunities

Per gap: uncovered code (functions, branches, error handlers), tests to write (plain language), why it matters (bug class caught), estimated effort (test count).

### 7. Track Trends

Compare to previous runs: ↑ improved, ↓ dropped (flag), → unchanged, ★ new file (needs initial coverage).
