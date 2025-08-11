import { Product } from './definition';

const laptop = Product.from({
  name: 'Gaming Laptop',
  price: 1299.99,
  stock: 5,
});

Product.isInStock(laptop); // true
Product.canBeSold(laptop, 3); // true
