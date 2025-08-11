import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type Product = InferModelOutput<typeof Product>;
export const Product = createModel(
  z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    category: z.enum(['electronics', 'clothing', 'books']),
  }),
);
