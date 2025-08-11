function applyDiscount(price: number, discount: number) {
  if (discount < 0 || discount > 1) {
    throw new Error('invalid_discount');
  }

  if (price < 0) {
    throw new Error('invalid_price');
  }

  return price * (1 - discount);
}

// Hidden errors - can crash at runtime
const result = applyDiscount(100, 1.5); // 💥 Throws
