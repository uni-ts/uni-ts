import { err, ok } from '@uni-ts/result';

function safeDivide(a: number, b: number) {
  return b === 0 ? err('division_by_zero') : ok(a / b);
}

// ---cut---
function calculate() {
  const x = safeDivide(10, 2); // Ok<number>
  const y = safeDivide(8, 0); // Err<'division_by_zero'>

  // No exceptions thrown, no flow interruption
  return { x, y };
}
