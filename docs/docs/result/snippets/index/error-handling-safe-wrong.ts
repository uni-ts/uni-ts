// @errors: 2339
import { err, ok } from '@uni-ts/result';

function safeDivide(a: number, b: number) {
  return b === 0 ? err('division_by_zero') : ok(a / b);
}

// ---cut---
function calculate() {
  const xResult = safeDivide(10, 2);
  const yResult = safeDivide(8, 0);

  // We cannot access data without checking for errors
  return xResult.data + yResult.data;
}
