import type { Result } from '@uni-ts/result';

declare function getUserSession(): Result<
  { id: string; name: string },
  'invalid_token' | 'session_expired'
>;

// ---cut---
import { unwrapOr } from '@uni-ts/result';

const data = unwrapOr(getUserSession(), { id: '0', name: 'unknown' });

console.log('Logged in as ', data.name);
