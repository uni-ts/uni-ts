import type { Result } from '@uni-ts/result';

declare function getUserSession(): Result<
  { id: string; name: string },
  'invalid_token' | 'session_expired'
>;

// ---cut---
import { match } from '@uni-ts/result';

const user = match(
  getUserSession(),
  (data) => {
    console.log('Logged in as ', data.name);
    return data;
  },
  (error) => {
    console.error('Session error: ', error);
    return null;
  },
);
