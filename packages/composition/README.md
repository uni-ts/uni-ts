# @uni-ts/composition

**Type-safe function composition**

The `@uni-ts/composition` package provides utilities for creating type-safe function pipelines in TypeScript. Compose functions together with full type inference, async support, and clean syntax that makes complex data transformations readable and maintainable.

## What's Function Composition?

Function composition is about combining multiple simple functions to build more complex operations. Instead of nested function calls that are hard to read, you can create clear, left-to-right pipelines that perform operations step by step.

Think of it like an assembly line where each function is a station that operates on the data before passing it to the next function.

## A Quick Example

Here's how data transformation typically works with nested calls:

```typescript
// Hard to read and maintain
const finalPrice = formatPrice(calculateTax(applyDiscount(getBasePrice(product), discount), taxRate));
```

With composition, the same transformation becomes a clear pipeline:

```typescript
import { flow } from '@uni-ts/composition';

const calculateFinalPrice = flow(
  getBasePrice,
  (price) => applyDiscount(price, discount),
  (price) => calculateTax(price, taxRate),
  formatPrice
);

const finalPrice = calculateFinalPrice(product);
```

The data flows from left to right, making it easy to understand each transformation step.

## Installation

```bash
npm install @uni-ts/composition
# or
yarn add @uni-ts/composition
# or
pnpm add @uni-ts/composition
```

## Basic Usage

### Creating Reusable Pipelines with `flow`

Use `flow` to create a reusable function that applies transformations in sequence:

```typescript
import { flow } from '@uni-ts/composition';

const getUserName = (user: User) => user.name;
const trim = (value: string) => value.trim();
const greet = (name: string) => `Hello, ${name}!`;

const userGreeting = flow(getUserName, trim, greet);

const greeting1 = userGreeting({ name: '  Alice' }); // "Hello, Alice!"
const greeting2 = userGreeting({ name: 'Bob  ' }); // "Hello, Bob!"
```

### Immediate Execution with `pipe`

Use `pipe` to immediately apply transformations to a value:

```typescript
import { pipe } from '@uni-ts/composition';

const getUserName = (user: User) => user.name;
const trim = (value: string) => value.trim();
const greet = (name: string) => `Hello, ${name}!`;

const greeting = pipe({ name: '  Alice' }, getUserName, trim, greet); // "Hello, Alice!"
```

### Working with Async Operations

Both `flow` and `pipe` automatically handle async functions and maintain proper typing:

```typescript
import { flow, pipe } from '@uni-ts/composition';

const fetchUserProfile = flow(
  (userId: string) => fetchUser(userId), // Returns Promise<User>
  async (user) => {
    const posts = await fetchUserPosts(user.id); // Returns Promise<Post[]>
    return { ...user, posts };
  },
  (profile) => formatProfile(profile) // Returns FormattedProfile
); // (userId: string) => Promise<FormattedProfile>

const profile = await fetchUserProfile('123'); // FormattedProfile

const userEmailData = pipe(
  '123',
  fetchUser, // Returns Promise<User>
  (user) => user.email, // Returns string
  async (email) => {
    const isValid = await validateEmail(email); // Returns Promise<boolean>
    return { email, isValid };
  }
); // Promise<{ email: string; isValid: boolean }>
```

### Builder Style API

For complex pipelines or when you prefer method chaining, use the builder style of `flow` and `pipe`. This style allows you to chain unlimited number of steps (default functions are limited to 10) but requires you to call `flow().create()` or `pipe().run()` to mark the end of the chain.

```typescript
import { flow, pipe } from '@uni-ts/composition/builder';

const getBasePrice = (product: Product) => product.price;
const applyDiscount = (discount: number) => (price: number) => price * (1 - discount);
const roundPrice = (price: number) => Math.round(price * 100) / 100;
const applyTax = (tax: number) => (price: number) => price * (1 + tax);
const formatPrice = (price: number) => `$${price.toFixed(2)}`;

const getProductFinalPrice = flow(getBasePrice)
  .andThen(applyDiscount(0.1))
  .andThen(applyTax(0.08))
  .andThen(roundPrice)
  .andThen(formatPrice)
  .create();

const finalPrice1 = getProductFinalPrice(product); // "$108.00"

const finalPrice2 = pipe(product)
  .andThen(getBasePrice)
  .andThen(applyDiscount(0.1))
  .andThen(applyTax(0.08))
  .andThen(roundPrice)
  .andThen(formatPrice)
  .run(); // "$108.00"
```

## Key Features

### 🔍 Full Type Safety

TypeScript automatically infers types throughout the entire pipeline:

```typescript
const pipeline = flow(
  (input: string) => input.length, // number
  (len) => len > 5, // boolean
  (isLong) => (isLong ? 'long' : 'short') // string
); // (input: string) => string
```

### ⚡ Async-Aware

Seamlessly mix synchronous and asynchronous operations:

```typescript
const fetchAndProcess = flow(
  (user: User) => user.id, // sync
  async (id) => fetchData(id), // async - makes whole pipeline async
  (response) => response.data, // sync (receives awaited data)
  (data) => data.toUpperCase() // sync
); // (user: User) => Promise<string>
```

### 🧩 Composable

Build complex operations from simple, testable functions:

```typescript
// Create small, focused functions
const trim = (str: string) => str.trim();
const toLowerCase = (str: string) => str.toLowerCase();
const addGreeting = (name: string) => `Hello, ${name}!`;

// Compose them into larger operations
const processName = flow(trim, toLowerCase, addGreeting);
const processNames = (names: string[]) => names.map(processName);
```

### 📝 Readable

Transform hard-to-read nested calls into clear, sequential steps:

```typescript
// Before: hard to follow the data flow
const result = formatCurrency(Math.round(applyTax(calculateDiscount(price, 0.1), 0.08)));

// After: clear step-by-step transformation
const result = pipe(
  price,
  (price) => calculateDiscount(price, 0.1),
  (price) => applyTax(price, 0.08),
  Math.round,
  formatCurrency
);
```
