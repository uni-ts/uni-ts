# Getting Started

This guide will walk you through installation, basic usage, and advanced patterns to help you build readable, maintainable data transformation pipelines.

## Installation

### Requirements

**TypeScript**: Version 5.3.0 or higher is required. We recommend using the latest stable version for the best experience and type safety.

**Configuration**: Make sure you have `"strict": true` (or at least `"strictNullChecks": true`) enabled in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

### Install the Package

You can install `@uni-ts/composition` using your preferred package manager:

::: code-group

```sh [npm]
$ npm add @uni-ts/composition
```

```sh [pnpm]
$ pnpm add @uni-ts/composition
```

```sh [yarn]
$ yarn add @uni-ts/composition
```

```sh [bun]
$ bun add @uni-ts/composition
```

:::

## Your First Composition

As you saw in the [Introduction](./index.md), function composition is about connecting simple functions to create complex transformations. Let's start with a basic example:

```typescript twoslash
import { flow, pipe } from '@uni-ts/composition';

// Define simple, focused functions
const double = (x: number) => x * 2;
const add10 = (x: number) => x + 10;
const toString = (x: number) => x.toString();

// Method 1: Create a reusable function with flow
const transform = flow(double, add10, toString);
const result1 = transform(5); // "20"
const result2 = transform(10); // "30"

// Method 2: Transform a value immediately with pipe
const result3 = pipe(5, double, add10, toString); // "20"
```

Both approaches produce the same result, but serve different purposes:

- **`flow`** creates a reusable function you can call multiple times
- **`pipe`** immediately transforms a specific value

> [!NOTE] 💡 Pro Tip
> Use `flow` when you need to apply the same transformation to multiple values, and `pipe` when you have a single value to transform.

## Core Functions

### `flow` - Build Reusable Pipelines

The `flow` function creates a new function by composing multiple functions in sequence. The output of each function becomes the input of the next.

```typescript twoslash
import { flow } from '@uni-ts/composition';

const greetUser = flow(
  (user: { name: string; email: string }) => user.name, // Extract name
  (name) => name.trim(), // Remove whitespace from sides
  (name) => `Hello, ${name}!` // Add greeting
);

const user = { name: '  Alice  ', email: 'alice@example.com' };
const greeting = greetUser(user); // "Hello, Alice!"
```

### `pipe` - Immediate Transformation

The `pipe` function applies a series of transformations to a value immediately and returns the final result.

```typescript twoslash
import { pipe } from '@uni-ts/composition';

const greeting = pipe(
  { name: '  Alice  ', email: 'alice@example.com' },
  (user) => user.name, // Extract name
  (name) => name.trim(), // Remove whitespace
  (name) => `Hello, ${name}!` // Add greeting
); // "Hello, Alice!"
```

## Async Operations

One of the most powerful features of `@uni-ts/composition` is seamless async support. When any function in the pipeline returns a Promise, the entire composition becomes asynchronous.

```typescript twoslash
import { flow } from '@uni-ts/composition';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const processData = flow(
  (data: string) => data.toUpperCase(),
  async (data) => {
    await delay(100);
    return data.split('');
  },
  (chars) => chars.reverse(),
  (chars) => chars.join('-')
);

const result = await processData('hello'); // "O-L-L-E-H"
```

> [!TIP] ⚡ TypeScript Magic
> Notice how TypeScript automatically infers that `processData` returns `Promise<string>` because one function in the pipeline is async, even though the last two functions are synchronous.

## Builder Style API

For complex pipelines or when you prefer method chaining, use the builder style API. As it doesn't require function overloads under the hood, it's more performant at the type level and has no limit on the number of functions you can chain together.

### `flow`

```typescript twoslash
import { flow } from '@uni-ts/composition/builder';

const greetUser = flow((user: { name: string; email: string }) => user.name)
  .andThen((name) => name.trim())
  .andThen((name) => `Hello, ${name}!`)
  .create(); // Call .create() at the end to output the function

const user = { name: '  Alice  ', email: 'alice@example.com' };
const greeting = greetUser(user); // "Hello, Alice!"
```

### `pipe`

```typescript twoslash
import { pipe } from '@uni-ts/composition/builder';

const greeting = pipe({ name: '  Alice  ', email: 'alice@example.com' })
  .andThen((user) => user.name) // Extract name
  .andThen((name) => name.trim()) // Remove whitespace
  .andThen((name) => `Hello, ${name}!`) // Add greeting
  .run(); // Call .run() to execute immediately // "Hello, Alice!"
```
