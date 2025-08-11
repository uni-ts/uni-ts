const data = { name: 'John', email: 'invalid', age: 25 };

// ---cut---
import { createSafeFirstModel } from '@uni-ts/model/safe';
import { z } from 'zod';

const User = createSafeFirstModel(
  z.object({
    name: z.string().min(1),
    email: z.email(),
    age: z.number().int().min(0),
  }),
);

// Safe by default, unsafe methods with prefix
const user1 = User.from(data);
const user2 = User.cast(data);
const user3 = User.unsafeFrom(data);
const user4 = User.unsafeCast(data);
