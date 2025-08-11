import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type User = InferModelOutput<typeof User>;
export const User = createModel(
  z.object({
    name: z.string().min(1),
    email: z.email(),
    age: z.number().int().min(0),
  }),
);
