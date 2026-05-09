---
name: run-and-fix-all-tests
description: Run all backend and frontend tests, then fix any failures
user_invocable: true
---

# /test - Run All Tests and Fix Failures

Run the full test suite for both backend and frontend. If any tests fail, diagnose and fix the issues.

## Steps

1. **Run backend tests** (pytest):
   ```
   cd backend && ./.venv/bin/python -m pytest -v --tb=short 2>&1
   ```

2. **Run frontend tests** (Angular/Karma):
   ```
   cd frontend && npx ng test --watch=false --browsers=ChromeHeadless 2>&1
   ```

3. **Analyze results**: If all tests pass, report the totals and stop.

4. **Fix failures**: If any tests fail:
   - Read the failing test file and the source file it tests
   - Determine if the failure is in the test (wrong expectation) or in the source (bug)
   - Fix the appropriate file
   - Re-run the failing suite to confirm the fix
   - Repeat until all tests pass

5. **Report**: Summarize what passed, what failed, and what was fixed.
