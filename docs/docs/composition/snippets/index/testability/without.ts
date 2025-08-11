type Product = {
  price: number;
  quantity: number;
};

type Discount = {
  from: number;
  rate: number;
};

type Order = {
  items: Product[];
  discount: Discount;
  taxRate: number;
  currency: string;
};
// ---cut---
// We need to think about all test cases for this function

function processOrder(order: Order) {
  const total = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const discountedTotal =
    total > order.discount.from ? total * (1 - order.discount.rate) : total;

  const totalAfterTax = discountedTotal * order.taxRate;

  return `Total price: ${order.currency}${totalAfterTax.toFixed(2)}`;
}
