---
'@uni-ts/result': patch
---

Add `tap` function that allows to do something with the result (side-effect) while preserving it unchanged for the further operations.

```typescript
const result = pipe(
  ok('hello'),
  tap((result) => {
    console.log('Result:', result); // Logs the result (side-effect)
    return 'something'; // Return value is ignored
  }),
  mapOk((data) => data.toUpperCase()) // Original result is passed through
); // { success: true, data: "HELLO" }
```
