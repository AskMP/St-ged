---
name: "task-audit"
description: "Scan open tasks for hygiene issues and produce an actionable report"
auto_invoke: false
triggers: ["task audit requested", "task hygiene review"]
---

# Task Auditor

## Instructions

### 1. Gather All Open Tasks

Run `{{cmd:list_all}}` and `{{cmd:list_all_open}}`. Per open task extract: ID, title, type, status, last note timestamp, description/acceptance criteria presence, parent task.

### 2. Check for Issues

**Critical**:
- Missing description/acceptance criteria
- Stale in_progress (no notes in 7+ days)
- Duplicate title (case-insensitive)
- Orphaned sub-task (parent closed)

**Warnings**:
- Missing type
- Empty epic (no sub-tasks)
- No recent notes (30+ days)
- Has description but no checkable criteria

### 3. Generate Audit Report

Include: date, total open/in_progress counts, critical issues table (task/title/issue/remediation), warnings table, healthy task count, summary counts.

### 4. Suggest Remediation

- **Missing criteria**: Suggest description template via `{{cmd:append_notes}}`
- **Stale tasks**: Close with note via `{{cmd:close_task}}`, or update status
- **Duplicates**: Identify which to keep, close other via `{{cmd:close_task}}`
- **Missing type**: Suggest type from title/description
- **Empty epics**: Suggest sub-task breakdown via `{{cmd:create_subtask}}` or convert to task
