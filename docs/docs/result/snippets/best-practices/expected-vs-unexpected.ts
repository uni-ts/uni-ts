declare type Product = { id: string; name: string; stock: number };
declare function findProduct(productId: string): Promise<Product | undefined>;
declare function saveOrder(
  productId: string,
  quantity: number,
): Promise<string>;

// ---cut---
import { err, ok } from '@uni-ts/result';

async function purchaseProduct(productId: string, quantity: number) {
  // Check if product exists (expected failure)
  const product = await findProduct(productId);
  if (!product) {
    return err({
      type: 'product_not_found',
      productId,
    });
  }

  // Check stock availability (expected failure)
  if (product.stock < quantity) {
    return err({
      type: 'insufficient_stock',
      requested: quantity,
      available: product.stock,
    });
  }

  // There are no expected errors for this database operation.
  // We should let it throw and get caught by our error handling
  // infrastructure placed on another application layer
  const orderId = await saveOrder(productId, quantity);

  return ok({ orderId });
}
