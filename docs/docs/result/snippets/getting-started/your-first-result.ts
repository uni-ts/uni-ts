function oneOf<const T extends unknown[]>(...values: T): T[number] {
  return values[Math.floor(Math.random() * values.length)];
}

// ---cut---
import type { Err, Ok, Result } from '@uni-ts/result';

const okResult: Ok<number> = { success: true, data: 10 };
const errResult: Err<string> = { success: false, error: 'not_found' };
const result: Result<number, string> = oneOf(okResult, errResult);
