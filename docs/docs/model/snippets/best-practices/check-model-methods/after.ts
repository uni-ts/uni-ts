declare function hashPassword(password: string): string;

// ---cut---
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type HashedPassword = InferModelOutput<typeof HashedPassword>;
export const HashedPassword = createModel(
  z.string().brand('HashedPassword'),
).extend({ verify });

function verify(hashedPassword: HashedPassword, plainPassword: string) {
  return hashPassword(plainPassword) === hashedPassword;
}

export type UserCredentials = InferModelOutput<typeof UserCredentials>;
export const UserCredentials = createModel(
  z.object({
    userId: z.uuid().brand('UserId'),
    email: z.email(),
    hashedPassword: HashedPassword.schema,
  }),
);
