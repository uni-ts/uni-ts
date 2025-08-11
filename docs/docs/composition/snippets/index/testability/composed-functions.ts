import { pipe } from '@uni-ts/composition';

interface Product {
  price: number;
  quantity: number;
}

interface Discount {
  from: number;
  rate: number;
}

interface Order {
  items: Product[];
  discount: Discount;
  taxRate: number;
  currency: string;
}
// ---cut---
// We can test each price calculation step independently

const getProductsCost = (products: Product[]) =>
  products.reduce((sum, item) => sum + item.price * item.quantity, 0);

const applyDiscount = (discount: Discount) => (price: number) =>
  price > discount.from ? price * (1 - discount.rate) : price;

const addTax = (taxRate: number) => (price: number) => price * (1 + taxRate);

const formatTotal = (currency: string) => (price: number) =>
  `Total price: ${currency}${price.toFixed(2)}`;

const processOrder = (order: Order) =>
  pipe(
    order.items,
    getProductsCost,
    applyDiscount(order.discount),
    addTax(order.taxRate),
    formatTotal(order.currency),
  );
