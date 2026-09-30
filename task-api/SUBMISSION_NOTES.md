# Submission Notes

## What I would test next

If I had more time, I would add tests for larger datasets, pagination boundary cases, concurrent requests, and more detailed validation scenarios. I would also test behavior around completed tasks and reassignment in different task states.

## What surprised me

One surprising finding was that the pagination logic skipped the first page because the offset was calculated as `page * limit`. I also found that status filtering used partial matching with `includes()`, which could return tasks for an invalid or partial status. Both issues were identified through tests and fixed.

## Questions I would ask before shipping to production

Before shipping this API to production, I would ask about the expected persistence/database solution, authentication and authorization requirements, the expected behavior when reassigning an already-assigned task, pagination limits, and the required error-handling contrac

## Test Results

- Test Suites: 2 passed
- Tests: 39 passed
- Statement Coverage: 96%
- Branch Coverage: 92.68%
- Function Coverage: 93.33%
- Line Coverage: 95.58%

Commands used:

```bash
npm test
npm run coverage
