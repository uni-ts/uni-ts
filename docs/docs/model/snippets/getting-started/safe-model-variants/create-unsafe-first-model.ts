const data = { name: 'John', email: 'invalid', age: 25 };

// ---cut---
import { createUnsafeFirstModel } from '@uni-ts/model/safe';
import { z } from 'zod';

const User = createUnsafeFirstModel(
  z.object({
    name: z.string().min(1),
    email: z.email(),
    age: z.number().int().min(0),
  }),
);

// Unsafe by default, safe methods with prefix
const user1 = User.from(data);
const user2 = User.cast(data);
const user3 = User.safeFrom(data);
const user4 = User.safeCast(data);
