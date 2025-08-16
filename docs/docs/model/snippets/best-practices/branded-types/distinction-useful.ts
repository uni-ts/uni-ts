interface Product {
  id: ProductId;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: OrderId;
  userId: UserId;
  products: Product[];
}

// ---cut---
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type UserId = InferModelOutput<typeof UserId>;
export const UserId = createModel(z.uuid().brand('UserId'));

export type ProductId = InferModelOutput<typeof ProductId>;
export const ProductId = createModel(z.uuid().brand('ProductId'));

export type OrderId = InferModelOutput<typeof OrderId>;
export const OrderId = createModel(z.uuid().brand('OrderId'));

// All ids have the same validation rules but distinguishing them
// ensures we don't pass the wrong one (e.g. userId where productId expected)
declare function createOrder(userId: UserId, productId: ProductId): OrderId;
declare function addProduct(orderId: OrderId, productId: ProductId): Order;
declare function getUserOrders(userId: UserId): Order[];
