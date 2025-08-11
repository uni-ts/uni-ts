import type { Result } from '@uni-ts/result';

declare function getUserSession(): Result<
  { id: string; name: string },
  'invalid_token' | 'session_expired'
>;

// ---cut---
import { unwrapOrNull } from '@uni-ts/result';

const data = unwrapOrNull(getUserSession());

console.log('Logged in as ', data?.name);
