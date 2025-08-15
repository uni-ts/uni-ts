import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type ProductId = InferModelOutput<typeof ProductId>;
export const ProductId = createModel(z.uuid().brand('ProductId'));

// Can be reused out of the product context
// e.g. to represent shipping cost
export type Price = InferModelOutput<typeof Price>;
export const Price = createModel(z.number().positive().brand('Price')).extend({
  toDisplayFormat,
});

export type Product = InferModelOutput<typeof Product>;
export const Product = createModel(
  z.object({
    id: ProductId.schema,
    name: z.string().min(1),
    price: Price.schema,
  }),
);

export type ProductInventory = InferModelOutput<typeof ProductInventory>;
export const ProductInventory = createModel(
  z.object({
    productId: ProductId.schema,
    stock: z.number().int().min(0),
    reservedStock: z.number().int().min(0),
  }),
).extend({ getAvailableStock });

export type ProductAnalytics = InferModelOutput<typeof ProductAnalytics>;
export const ProductAnalytics = createModel(
  z.object({
    productId: ProductId.schema,
    viewCount: z.number().int().min(0),
    lastViewedAt: z.date().optional(),
  }),
).extend({ trackView });

function toDisplayFormat(price: Price) {
  return `$${price.toFixed(2)}`;
}

function getAvailableStock(product: ProductInventory) {
  return product.stock - product.reservedStock;
}

function trackView(product: ProductAnalytics) {
  return {
    ...product,
    viewCount: product.viewCount + 1,
    lastViewedAt: new Date(),
  };
}
