// Doesn't follow the first rule of domain models.
// Shape of the products API endpoint response
// is not a business concept but a technical detail.

import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';
import { Product } from './product';

export type ProductsApiResponse = InferModelOutput<typeof ProductsApiResponse>;
export const ProductsApiResponse = createModel(
  z.object({
    data: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        price: z.number(),
        quantity: z.number(),
        is_active: z.boolean(),
      }),
    ),
    pagination: z.object({
      total: z.int().positive(),
      page: z.int().positive(),
      limit: z.int().positive(),
    }),
  }),
).extend({
  toProducts,
});

// It's usually a good practice to convert
// non-domain models into domain ones.
function toProducts(data: ProductsApiResponse): Product[] {
  return data.data.map((product) =>
    Product.from({
      id: product.id,
      name: product.title,
      price: product.price,
      quantity: product.quantity,
      isActive: product.is_active,
    }),
  );
}
