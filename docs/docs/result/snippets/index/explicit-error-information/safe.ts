import { err, isErr, ok } from '@uni-ts/result';

function safeDivide(a: number, b: number) {
  return b === 0 ? err('division_by_zero') : ok(a / b);
}

// ---cut---
function calculate() {
  const xResult = safeDivide(10, 2);
  const yResult = safeDivide(8, 0);

  // We're sure errors come from the `safeDivide` function
  if (isErr(xResult) || isErr(yResult)) {
    return 0;
  }

  // ... maybe some more functions
  // TypeScript will tell us if they can fail and how

  return xResult.data + yResult.data;
}
