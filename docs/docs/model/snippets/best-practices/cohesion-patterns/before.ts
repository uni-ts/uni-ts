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
    stock: z.number().int().min(0),
    reservedStock: z.number().int().min(0),
    viewCount: z.number().int().min(0),
    lastViewedAt: z.date().optional(),
  }),
  {
    getDisplayPrice,
    getAvailableStock,
    trackView,
  },
);

// Uses only one property
function getDisplayPrice(product: Product) {
  return `$${product.price.toFixed(2)}`;
}

// stock and reservedStock are used together
function getAvailableStock(product: Product) {
  return product.stock - product.reservedStock;
}

// viewCount and lastViewedAt change together
function trackView(product: Product) {
  return {
    ...product,
    viewCount: product.viewCount + 1,
    lastViewedAt: new Date(),
  };
}
