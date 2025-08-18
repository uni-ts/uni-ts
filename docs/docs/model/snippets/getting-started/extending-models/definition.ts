import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type Product = InferModelOutput<typeof Product>;
export const Product = createModel(
  z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    stock: z.number().int().min(0),
  }),
  {
    isInStock,
    canBeSold,
  },
);

function isInStock(product: Product) {
  return product.stock > 0;
}

function canBeSold(product: Product, quantity: number) {
  return product.stock >= quantity && quantity > 0;
}
