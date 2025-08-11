import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

const User = createModel(
  z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().int().min(0),
  }),
);

// Get the TypeScript type
type User = InferModelOutput<typeof User>;
