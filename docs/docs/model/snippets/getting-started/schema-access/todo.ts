import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type Todo = InferModelOutput<typeof Todo>;
export const Todo = createModel(
  z.object({
    id: z.int().positive(),
    title: z.string().min(1),
    completed: z.boolean().default(false),
  }),
);
