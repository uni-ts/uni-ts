import { pipe } from '@uni-ts/composition';

function getBasePrice(product: { price: number }) {
  return product.price;
}
function applyDiscount(price: number, discount: number) {
  return price * (1 - discount);
}
function calculateTax(price: number, rate: number) {
  return price * (1 + rate);
}
function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

declare const product: { price: number };
declare const discount: number;
declare const taxRate: number;

// ---cut---
const finalPrice = pipe(
  product,
  getBasePrice,
  (price) => applyDiscount(price, discount),
  (price) => calculateTax(price, taxRate),
  formatPrice,
);
