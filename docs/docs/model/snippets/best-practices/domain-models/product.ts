import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type ProductId = InferModelOutput<typeof ProductId>;
export const ProductId = createModel(z.uuid().brand('ProductId'));

export type Product = InferModelOutput<typeof Product>;
export const Product = createModel(
  z.object({
    id: ProductId.schema,
    name: z.string().min(1),
    price: z.number().positive(),
    quantity: z.int().nonnegative(),
    isActive: z.boolean(),
  }),
).extend({
  canBePurchased,
  applyDiscount,
  isOutOfStock,
});

function canBePurchased(product: Product, quantity: number) {
  return product.isActive && product.quantity >= quantity;
}

function applyDiscount(product: Product, discountPercent: number) {
  return {
    ...product,
    price: product.price * (1 - discountPercent / 100),
  };
}

function isOutOfStock(product: Product) {
  return product.quantity === 0;
}
