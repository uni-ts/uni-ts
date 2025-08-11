const data = { name: 'John', email: 'invalid', age: 25 };

// ---cut---
import { createSafeModel } from '@uni-ts/model/safe';
import { z } from 'zod';

const User = createSafeModel(
  z.object({
    name: z.string().min(1),
    email: z.email(),
    age: z.number().int().min(0),
  }),
);

// Only safe methods available
const user1 = User.from(data);
const user2 = User.cast(data);
