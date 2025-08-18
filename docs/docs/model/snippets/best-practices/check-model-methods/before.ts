declare function hashPassword(password: string): string;

// ---cut---
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type UserCredentials = InferModelOutput<typeof UserCredentials>;
export const UserCredentials = createModel(
  z.object({
    userId: z.uuid().brand('UserId'),
    email: z.email(),
    hashedPassword: z.string().brand('HashedPassword'),
  }),
  {
    verifyPassword,
  },
);

// It uses only one model property.
// It's a sign `hashedPassword` may be extracted to a separate model.
function verifyPassword(user: UserCredentials, plainPassword: string) {
  return hashPassword(plainPassword) === user.hashedPassword;
}
