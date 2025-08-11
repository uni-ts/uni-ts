import { err, ok } from '@uni-ts/result';

function safeDivide(a: number, b: number) {
  return b === 0 ? err('division_by_zero') : ok(a / b);
}

// TypeScript correctly shows it can return a number or an error.
const result = safeDivide(10, 0);
//    ^?
