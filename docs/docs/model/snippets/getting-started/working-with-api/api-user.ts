import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';
import { User } from './user';

// API response model
export type ApiUser = InferModelOutput<typeof ApiUser>;
export const ApiUser = createModel(
  z.object({
    id: z.uuid(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.email(),
    created_at: z.number().int().min(0),
  }),
).extend({ toUser });

function toUser(apiUser: ApiUser) {
  return User.from({
    id: apiUser.id,
    name: `${apiUser.first_name} ${apiUser.last_name}`,
    email: apiUser.email,
    createdAt: new Date(apiUser.created_at),
  });
}
