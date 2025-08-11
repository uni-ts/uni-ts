import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

// Domain model with business logic
export type User = InferModelOutput<typeof User>;
export const User = createModel(
  z.object({
    id: z.uuid().brand('UserId'),
    name: z.string().min(1),
    email: z.email().brand('Email'),
    createdAt: z.date(),
  }),
).extend({ isNew });

function isNew(user: User) {
  const daysSinceCreation =
    (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceCreation <= 7;
}
