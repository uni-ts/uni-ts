function oneOf<const T extends unknown[]>(...values: T): T[number] {
  return values[Math.floor(Math.random() * values.length)];
}

// ---cut---
import { err, ok } from '@uni-ts/result';

const okResult = ok(10);
const errResult = err('not_found');
const result = oneOf(okResult, errResult);
