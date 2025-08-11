import type { Result } from '@uni-ts/result';

declare function getUserSession(): Result<
  { id: string; name: string },
  'invalid_token' | 'session_expired'
>;

// ---cut---
import { isErr } from '@uni-ts/result';

const result = getUserSession();

if (isErr(result)) {
  console.error('Session error: ', result.error);
} else {
  console.log('Logged in as ', result.data.name);
}
