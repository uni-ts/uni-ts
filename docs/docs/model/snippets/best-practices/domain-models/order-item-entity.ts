const saveOrderItemSql = `
    INSERT INTO order_items (id, product_id, quantity, unit_price, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id)
    DO UPDATE SET
      product_id = EXCLUDED.product_id,
      quantity = EXCLUDED.quantity,
      unit_price = EXCLUDED.unit_price,
      updated_at = EXCLUDED.updated_at
  `;

declare interface DatabaseClient {
  query(sql: string, params: unknown[]): Promise<void>;
}

declare const db: DatabaseClient;

// ---cut---
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

// Doesn't follow any of the domain model rules
// Shape of database entities isn't a business concept.
// It depends on the database client.
export type OrderItemEntity = InferModelOutput<typeof OrderItemEntity>;
export const OrderItemEntity = createModel(
  z.object({
    id: z.uuid(),
    product_id: z.uuid(),
    quantity: z.int().positive(),
    unit_price: z.number().positive(),
    created_at: z.date(),
    updated_at: z.date(),
  }),
).extend({
  save,
});

async function save(orderItemEntity: OrderItemEntity): Promise<void> {
  await db.query(saveOrderItemSql, Object.values(orderItemEntity));
}
