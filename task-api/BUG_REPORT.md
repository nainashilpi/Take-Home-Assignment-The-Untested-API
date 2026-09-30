
# Bug Report

## Bug 1: Pagination skips the first page

### Location

`src/services/taskService.js`

### Issue

The pagination offset was calculated as:

```js
const offset = page * limit;
```

This caused the first page to be skipped.

### How the bug was discovered

A Jest unit test was written to verify that the first page returns the first two tasks.

Test input:

* Page: `1`
* Limit: `2`

Four tasks were created:

* Task 1
* Task 2
* Task 3
* Task 4

### Expected behavior

For page 1 with a limit of 2, the service should return:

```text
Task 1
Task 2
```

### Actual behavior

The test received:

```text
Task 3
Task 4
```

### Why this happened

For page 1 and limit 2, the original code calculated:

```text
offset = page * limit
offset = 1 * 2
offset = 2
```

Since array indexing starts from `0`, index `2` is the third task.

Therefore, the code effectively performed:

```js
tasks.slice(2, 4)
```

which returned Task 3 and Task 4.

### Fix

The offset was changed to:

```js
const offset = (page - 1) * limit;
```

For page 1:

```text
offset = (1 - 1) * 2
offset = 0
```

This makes the first page start from the first task.

### Verification

The pagination tests were run again after the fix.

The first page correctly returned:

```text
Task 1
Task 2
```

The second page also correctly returned:

```text
Task 3
Task 4
```

---

## Bug 2: Status filtering allows partial matches

### Location

`src/services/taskService.js`

### Issue

The `getByStatus()` function originally used `includes()` to match task statuses:

```js
const getByStatus = (status) => tasks.filter((t) => t.status.includes(status));
```

This allowed partial status values to match valid task statuses.

### How the bug was discovered

A Jest unit test was written to verify that an invalid or partial status does not return tasks.

Test input:

```js
getByStatus('progress')
```

A task with the status `in_progress` already existed.

### Expected behavior

Searching for `progress` should return no tasks because `progress` is not an exact valid status.

Expected:

```text
0 tasks
```

### Actual behavior

The function returned:

```text
Build Project
status: in_progress
```

The returned array had a length of `1`.

### Why this happened

The original implementation used:

```js
t.status.includes(status)
```

Since:

```text
"in_progress".includes("progress")
```

returns `true`, the task was incorrectly included in the results.

### Fix

Status filtering was changed to use an exact comparison:

```js
const getByStatus = (status) => tasks.filter((t) => t.status === status);
```

### Verification

The status filtering tests were run again after the fix.

Searching for:

```js
getByStatus('progress')
```

correctly returned:

```text
0 tasks
```

The complete test suite currently passes with  **39/39 tests** .
