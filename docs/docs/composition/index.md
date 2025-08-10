# Introduction

:::info
This is an introduction to **function composition concept** itself. For package documentation, see the [Getting Started](/docs/composition/getting-started) guide.
:::

## What is Function Composition?

Function composition is a programming concept that allows you to combine multiple simple functions to create more complex operations. Think of it like an assembly line where data flows through a series of transformations, with each function performing a specific operation before passing the result to the next function.

Instead of writing complex, nested function calls that are hard to read and maintain, composition lets you create clear, step-by-step pipelines that transform data from input to output.

```typescript twoslash
import { flow } from '@uni-ts/composition';

const trim = (str: string) => str.trim();
const toLowerCase = (str: string) => str.toLowerCase();
const upperFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const addGreeting = (name: string) => `Hello, ${name}!`;

// Compose simple functions into a complex operation
const greet = flow(trim, toLowerCase, upperFirst, addGreeting);
console.log(greet('  ALICE  ')); // "Hello, Alice!"
```

## Why Use Function Composition?

Function composition transforms how you structure and think about your code, by encouraging you to break things down into smaller, reusable functions. Let's explore why this matters through practical examples.

### Readability: From Nested Chaos to Clear Pipelines

Traditional nested function calls read from inside-out (right to left), making it difficult to follow the data transformation flow.

```typescript twoslash
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
const finalPrice = formatPrice(
  calculateTax(applyDiscount(getBasePrice(product), discount), taxRate)
);
```

The composed version reads like a step-by-step recipe.

```typescript twoslash
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
// Clear left-to-right pipe that matches how we think
const finalPrice = pipe(
  product,
  getBasePrice,
  (price) => applyDiscount(price, discount),
  (price) => calculateTax(price, taxRate),
  formatPrice
);
```

### Reusability: Build Once, Use Everywhere

Composition encourages you to create small functions that can be easily reused in multiple pipelines.

:::code-group

```typescript twoslash [With composition]
import { flow } from '@uni-ts/composition';

const suffix = (suffix: string) => (str: string) => str + suffix;
const upperFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const fallback = (fallback: string) => (str: string) => str.trim() || fallback;

export const getUserDisplayName = flow(fallback('Anonymous'), upperFirst);
export const getAdminDisplayName = flow(upperFirst, suffix(' (Admin)'));
export const getNewBlogpostTitle = flow(fallback('Untitled'), suffix(' (New)'));
```

```typescript twoslash [Without composition]
function getUserDisplayName(name: string) {
  const result = name.trim() || 'Anonymous';
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function getAdminDisplayName(name: string) {
  const result = name.charAt(0).toUpperCase() + name.slice(1);
  return result + ' (Admin)';
}

function getNewBlogpostTitle(title: string) {
  const result = title.trim() || 'Untitled';
  return result + ' (New)';
}
```

:::

### Testability: Small Functions, Big Confidence

By writing small, focused functions testing becomes a breeze. It's also far less likely you forget to test some part of a function.

:::code-group

```typescript twoslash [Monolithic function]
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
// We need to think about all test cases for this function
function processOrder(order: Order) {
  const total = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discountedTotal =
    total > order.discount.from ? total * (1 - order.discount.rate) : total;

  const totalAfterTax = discountedTotal * order.taxRate;

  return `Total price: ${order.currency}${totalAfterTax.toFixed(2)}`;
}
```

```typescript twoslash [Composed functions]
// @errors: 2304 2339 2304 233

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
import { pipe } from '@uni-ts/composition';

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
    order,
    getProductsCost,
    applyDiscount(order.discount),
    addTax(order.taxRate),
    formatTotal(order.currency)
  );
```

:::

## Getting Started

Ready to start using function composition in your project? Check out the [Getting Started](/docs/composition/getting-started) guide to learn how to install and use the `@uni-ts/composition` package.
