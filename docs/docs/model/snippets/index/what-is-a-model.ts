import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

// Type of a valid Product
type Product = InferModelOutput<typeof Product>;

const Product = createModel(
  // Structure: what properties a Product has and what rules they follow
  z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    amount: z.int().positive(),
  }),
  {
    // Behavior: what operations can be performed on a Product
    canBeSold: (product: Product) => product.amount > 0,
  },
);
