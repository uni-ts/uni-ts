---
'@uni-ts/result': patch
---

Add `toTuple` function that returns a tuple of the data and error from a result.

```typescript
function divide(a: number, b: number) {
  return b === 0 ? err('division_by_zero') : ok(a / b);
}

const [data, error] = toTuple(divide(10, 2));

if (!error) {
  console.log(`Division result is: ${data}`);
}
```
