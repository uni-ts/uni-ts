import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';
import { ProductId } from './product';

export type OrderItemId = InferModelOutput<typeof OrderItemId>;
export const OrderItemId = createModel(z.uuid().brand('OrderItemId'));

export type OrderItem = InferModelOutput<typeof OrderItem>;
export const OrderItem = createModel(
  z.object({
    id: OrderItemId.schema,
    productId: ProductId.schema,
    quantity: z.int().positive(),
    unitPrice: z.number().positive(),
  }),
).extend({
  getTotalPrice,
});

function getTotalPrice(orderItem: OrderItem) {
  return orderItem.quantity * orderItem.unitPrice;
}
