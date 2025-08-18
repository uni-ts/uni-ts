import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';
import { OrderItem } from './order-item';

export type OrderId = InferModelOutput<typeof OrderId>;
export const OrderId = createModel(z.uuid().brand('OrderId'));

export type Order = InferModelOutput<typeof Order>;
export const Order = createModel(
  z.object({
    id: OrderId.schema,
    customerId: z.uuid().brand('CustomerId'),
    items: z.array(OrderItem.schema),
    status: z.enum(['pending', 'confirmed', 'shipped', 'cancelled']),
    createdAt: z.date(),
  }),
  {
    getTotalPrice,
    canBeCancelled,
  },
);

function getTotalPrice(order: Order) {
  return order.items.reduce(
    (total, item) => total + OrderItem.getTotalPrice(item),
    0,
  );
}

function canBeCancelled(order: Order) {
  return order.status === 'pending' || order.status === 'confirmed';
}
