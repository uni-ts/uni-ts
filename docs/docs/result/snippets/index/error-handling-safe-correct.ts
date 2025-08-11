import { err, isErr, ok } from '@uni-ts/result';

function safeDivide(a: number, b: number) {
  return b === 0 ? err('division_by_zero') : ok(a / b);
}

// ---cut---
function calculate() {
  const xResult = safeDivide(10, 2);
  const yResult = safeDivide(8, 0);

  // Handle errors first
  if (isErr(xResult) || isErr(yResult)) {
    return 0;
  }

  // Then safely access the data
  return xResult.data + yResult.data;
}
