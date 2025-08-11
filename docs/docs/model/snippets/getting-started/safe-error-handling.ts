import { createSafeModel } from '@uni-ts/model/safe';
import { isOk } from '@uni-ts/result';
import { z } from 'zod';

const User = createSafeModel(
  z.object({
    name: z.string().min(1),
    email: z.email(),
    age: z.number().int().min(0),
  }),
);

// Safe validation returns Result instead of throwing
const result = User.from({ name: 'John', email: 'invalid', age: 25 });

if (isOk(result)) {
  console.log('User created:', result.data);
} else {
  console.error('Validation failed:', result.error);
}
