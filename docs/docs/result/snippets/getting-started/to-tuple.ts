import type { Result } from '@uni-ts/result';

declare function getUserSession(): Result<
  { id: string; name: string },
  'invalid_token' | 'session_expired'
>;

// ---cut---
import { toTuple } from '@uni-ts/result';

const result = getUserSession();
const [data, error] = toTuple(result);

if (data) {
  console.log('Logged in as ', data.name);
} else {
  console.error('Session error: ', error);
}
