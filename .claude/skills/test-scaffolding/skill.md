---
name: "test-scaffolding"
description: "Generate test file skeletons from source files"
auto_invoke: true
triggers: ["new source file created without test", "test scaffolding requested", "coverage gaps need addressing"]
---

# Test Scaffolding

## Instructions

### 1. Analyze Source File

Read source file and extract: exported functions/classes/constants, function signatures (params, return types), dependencies/imports, error paths and edge cases.

### 2. Determine Test File Location

Follow project conventions:
- Co-located: `module.test.ts` next to `module.ts` (default)
- `__tests__` dir: `__tests__/module.test.ts`
- Separate tree: `tests/unit/module.test.ts`

### 3. Generate Test Skeleton

Per exported function/class: describe block with happy path, edge cases (empty/null/boundary), error cases. Use Arrange/Act/Assert pattern with TODO markers for values.

### 4. Test Categories

Per function:
- **Happy path**: Normal inputs → expected outputs (required)
- **Empty inputs**: null, undefined, empty string/array (required)
- **Boundary values**: 0, -1, MAX_INT, empty collections (required)
- **Error cases**: Invalid inputs, missing dependencies (required)
- **Type edge cases**: Wrong types, NaN, Infinity (optional)
- **Async behavior**: Promises, timeouts, concurrent calls (if applicable)
- **State transitions**: Before/after state changes (if applicable)

### 5. Testing Pyramid

- **Unit** (60%): Individual functions, pure logic — mock external deps
- **Integration** (30%): Component interactions, API calls — use real/realistic implementations
- **E2E** (10%): Full user workflows

### 6. Test Quality vs. App Quality

**Passing tests do not mean the app works.** A test suite built entirely on mocks proves that the mock layer is consistent — not that the app functions. A component tested in isolation may render perfectly in a test harness while being completely unreachable in the actual app because it was never wired to a route.

**Minimum integration test requirements**:
- Every feature must include at least one test that exercises the real implementation (not mocked) — e.g., hitting a real route handler, rendering a component through the actual router, or querying a real (test) database.
- For UI features: at least one test must verify the page/route renders when navigated to via the app's router. This catches "built but never wired" components.
- For API features: at least one test must make a real HTTP request to the running server (supertest, test client, etc.), not just call the handler function directly.

**Required test categories for UI**:
- **Route rendering**: Does the page load when you navigate to its URL?
- **Navigation resolution**: Do links/buttons that should navigate to this feature actually reach it?
- **Component wiring**: Is the component imported and rendered by its host page (not just exported)?

### 7. Coverage Targets

Core logic 90%+ | UI Components 80%+ | Utilities 85%+ | Services 85%+ | Overall minimum 75%

### 8. Best Practices

- `data-testid` for UI element selection, `waitFor()` not arbitrary `wait(ms)`
- Tests independent (any order), each tests one behavior
- Descriptive `it('should...')` names, co-locate unit tests with source
- **Distinguish unit from integration**: Label test files or describe blocks clearly (e.g., `describe('integration: ...')` vs `describe('unit: ...')`). A test that mocks every dependency is a unit test, not an integration test, regardless of what it's called.
- **At least one route-level test per UI feature**: Use the project's actual router in at least one test to verify the component is reachable, not just renderable.
