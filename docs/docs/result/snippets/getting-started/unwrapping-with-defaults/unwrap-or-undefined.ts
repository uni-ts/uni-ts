import type { Result } from '@uni-ts/result';

declare function getUserSession(): Result<
  { id: string; name: string },
  'invalid_token' | 'session_expired'
>;

// ---cut---
import { unwrapOrUndefined } from '@uni-ts/result';

const data = unwrapOrUndefined(getUserSession());

console.log('Logged in as ', data?.name);
