import type { Result } from '@uni-ts/result';

declare function getUserSession(): Result<
  { id: string; name: string },
  'invalid_token' | 'session_expired'
>;

// ---cut---
import { isOk } from '@uni-ts/result';

const result = getUserSession();

if (isOk(result)) {
  console.log('Logged in as ', result.data.name);
} else {
  console.error('Session error: ', result.error);
}
