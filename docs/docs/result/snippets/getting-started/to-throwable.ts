import type { Result } from '@uni-ts/result';

declare function getUserSession(): Result<
  { id: string; name: string },
  'invalid_token' | 'session_expired'
>;

// ---cut---
import { toThrowable } from '@uni-ts/result';

const unsafeGetUserSession = toThrowable(getUserSession);
const user = unsafeGetUserSession();
