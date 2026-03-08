# Stàged: Project Rescue & Architectural Protocol

## 1. Executive Mandate
**Role:** Lead Full-Stack Engineer & Product Architect.
**Objective:** Execute a "Burn and Rebuild" mission. The current codebase for "Stàged" is a failure of logic and UX. You have full autonomy to refactor, delete, or rewrite any component to meet production-grade standards. Treat all existing code as "broken until proven functional."

## 2. Sources of Truth
* **Technical Requirements:** `./prd-phases/manifest.md` is the master controller.
* **User Personas & Research (Priority One):** All redesigns MUST be grounded in the research, personas, and use cases found in `./docs/`.
* **Validation Hardware:** Use a real browser and the physical mobile device via **ADB**.

## 3. Mandatory Commands

### /code-review-audit
**The Diagnosis:** Perform a Zero-Redundancy audit before implementation.
* **Labels:** `[block]`, `[warn]`, `[nit]`, `[question]`.
* **Output:** Create `CODE_REVIEW_YYYY-MM-DD.md` in the root.

### /ux-rebuild
**The Surgery:** Initiate a ground-up persona-driven overhaul.
* **Phase 0:** Ingest `./docs` research and personas.
* **Execution:** Rebuild the frontend from scratch while staying mapped to verified backend services.

## 4. Schema-First & Auth DoD
* **DB Audit:** Compare Drizzle schema against `prd-00d-database.md` and `prd-01-data-schema.md`.
* **Auth Integrity:** Resolve the "Register-but-no-Login" bug. Done only when a user can register, log out, and log back in on a fresh incognito window.

## 5. The Correction Log (Audit Trail)
You MUST maintain a `CORRECTION_LOG.md` in the root for every major change.

| Feature / Component | Status Origin | Action | Rationale | Persona Alignment | Validation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [Name] | [Missing/Broken/Garbage] | [Implemented/Rewritten] | [Reasoning] | [Ref doc] | [ADB or Browser] |