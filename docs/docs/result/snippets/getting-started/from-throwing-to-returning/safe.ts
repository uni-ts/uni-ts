import { err, ok } from '@uni-ts/result';

// ---cut---
function applyDiscount(price: number, discount: number) {
  if (discount < 0 || discount > 1) {
    return err('invalid_discount');
  }

  if (price < 0) {
    return err('invalid_price');
  }

  return ok(price * (1 - discount));
}

// TypeScript knows this can fail and requires you to handle it
const result = applyDiscount(100, 1.5);
