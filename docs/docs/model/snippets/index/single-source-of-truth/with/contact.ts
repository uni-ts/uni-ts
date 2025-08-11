import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type Contact = InferModelOutput<typeof Contact>;
export const Contact = createModel(
  z.object({
    id: z.uuid(),
    email: z.string().email(),
    name: z.string().min(3),
  }),
);
