#!/usr/bin/env bash
# run-tests — Auto-runs tests after file edits. Exit 0 always (non-blocking).
# Detects runner (jest/vitest/pytest/go/cargo/rspec/mix). See _template-hook.sh for conventions.

set -euo pipefail

# --- Ensure Node is on PATH for non-interactive shells ---
source "$(dirname "$0")/_resolve-node-path.sh"

# --- Configuration ---
CHANGED_FILES=("$@")

# --- Helper Functions ---
log_info() {
    echo "[run-tests] $*"
}

log_warn() {
    echo "[run-tests] WARNING: $*" >&2
}

log_result() {
    local status="$1"
    local detail="$2"
    if [ "$status" = "pass" ]; then
        echo "[run-tests] PASS: $detail"
    else
        echo "[run-tests] FAIL: $detail"
    fi
}

# --- Test Runner Detection ---

detect_runner() {
    # JavaScript/TypeScript
    if [ -f "vitest.config.ts" ] || [ -f "vitest.config.js" ]; then
        echo "vitest"
        return
    fi
    if [ -f "jest.config.ts" ] || [ -f "jest.config.js" ] || [ -f "jest.config.cjs" ]; then
        echo "jest"
        return
    fi
    if [ -f "package.json" ] && command -v node &>/dev/null; then
        # Check package.json for test script hints
        if node -e "const p=require('./package.json'); process.exit(JSON.stringify(p).includes('vitest') ? 0 : 1)" 2>/dev/null; then
            echo "vitest"
            return
        fi
        if node -e "const p=require('./package.json'); process.exit(JSON.stringify(p).includes('jest') ? 0 : 1)" 2>/dev/null; then
            echo "jest"
            return
        fi
    fi

    # Python
    if [ -f "pyproject.toml" ] || [ -f "pytest.ini" ] || [ -f "setup.cfg" ]; then
        if command -v pytest &>/dev/null; then
            echo "pytest"
            return
        fi
    fi

    # Go
    if [ -f "go.mod" ]; then
        echo "gotest"
        return
    fi

    # Rust
    if [ -f "Cargo.toml" ]; then
        echo "cargotest"
        return
    fi

    # Ruby
    if [ -f "Gemfile" ] && command -v rspec &>/dev/null; then
        echo "rspec"
        return
    fi

    # Elixir
    if [ -f "mix.exs" ]; then
        echo "mixtest"
        return
    fi

    echo ""
}

# --- Find Related Test Files ---

find_related_tests() {
    local file="$1"
    local base dir ext

    base=$(basename "$file")
    dir=$(dirname "$file")
    ext="${base##*.}"
    base="${base%.*}"

    # Common test file patterns
    local patterns=(
        "${dir}/${base}.test.${ext}"
        "${dir}/${base}.spec.${ext}"
        "${dir}/__tests__/${base}.test.${ext}"
        "${dir}/__tests__/${base}.spec.${ext}"
        "${dir}/test_${base}.${ext}"
        "${dir}/${base}_test.${ext}"
        "${dir}/${base}_spec.${ext}"
    )

    for pattern in "${patterns[@]}"; do
        if [ -f "$pattern" ]; then
            echo "$pattern"
            return
        fi
    done

    # If the file itself is a test file, return it
    if [[ "$base" =~ (test_|_test|\.test|\.spec|_spec) ]]; then
        echo "$file"
        return
    fi
}

# --- Run Tests ---

# Timeout is managed by Claude Code's hook "timeout" setting in settings.json,
# not by GNU timeout in-script. This keeps hooks cross-platform (macOS + Linux).

run_jest() {
    local files=("$@")
    npx jest --passWithNoTests --no-coverage "${files[@]}" 2>&1
}

run_vitest() {
    local files=("$@")
    npx vitest run --reporter=verbose "${files[@]}" 2>&1
}

run_pytest() {
    local files=("$@")
    pytest -x --tb=short "${files[@]}" 2>&1
}

run_gotest() {
    local files=("$@")
    local dirs=()
    for f in "${files[@]}"; do
        dirs+=("$(dirname "$f")")
    done
    # Deduplicate directories
    local unique_dirs
    unique_dirs=$(printf '%s\n' "${dirs[@]}" | sort -u)
    for d in $unique_dirs; do
        go test -v "./$d/..." 2>&1
    done
}

run_cargotest() {
    cargo test 2>&1
}

run_rspec() {
    local files=("$@")
    rspec "${files[@]}" 2>&1
}

run_mixtest() {
    local files=("$@")
    mix test "${files[@]}" 2>&1
}

# --- Main Logic ---
main() {
    if [ ${#CHANGED_FILES[@]} -eq 0 ]; then
        log_info "No changed files, skipping tests."
        return 0
    fi

    local runner
    runner=$(detect_runner)

    if [ -z "$runner" ]; then
        log_info "No test runner detected, skipping."
        return 0
    fi

    log_info "Detected test runner: $runner"

    # Find related test files
    local test_files=()
    for file in "${CHANGED_FILES[@]}"; do
        [ -f "$file" ] || continue
        local test_file
        test_file=$(find_related_tests "$file")
        if [ -n "$test_file" ]; then
            test_files+=("$test_file")
        fi
    done

    if [ ${#test_files[@]} -eq 0 ]; then
        log_info "No related test files found for changed files."
        return 0
    fi

    # Deduplicate
    local unique_tests
    unique_tests=$(printf '%s\n' "${test_files[@]}" | sort -u)
    # shellcheck disable=SC2206
    test_files=($unique_tests)

    log_info "Running ${#test_files[@]} test file(s)..."

    local output
    local exit_code=0
    case "$runner" in
        jest)       output=$(run_jest "${test_files[@]}") || exit_code=$? ;;
        vitest)     output=$(run_vitest "${test_files[@]}") || exit_code=$? ;;
        pytest)     output=$(run_pytest "${test_files[@]}") || exit_code=$? ;;
        gotest)     output=$(run_gotest "${test_files[@]}") || exit_code=$? ;;
        cargotest)  output=$(run_cargotest) || exit_code=$? ;;
        rspec)      output=$(run_rspec "${test_files[@]}") || exit_code=$? ;;
        mixtest)    output=$(run_mixtest "${test_files[@]}") || exit_code=$? ;;
    esac

    if [ "$exit_code" -eq 0 ]; then
        log_result "pass" "All tests passed."
    else
        log_result "fail" "Some tests failed (exit code: $exit_code)."
        echo "$output" | tail -20
    fi
}

# --- Entry Point ---
# Non-blocking: always exit 0
main "$@" || {
    log_warn "Test runner failed, but continuing (non-blocking)."
    exit 0
}
