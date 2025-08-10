# Introduction

:::info
This is an introduction to the **Result type concept** itself. For package documentation, see the [Getting Started](/docs/result/getting-started) guide.
:::

## What is a Result Type?

A Result type is a powerful concept from functional programming that represents the outcome of an operation that can either succeed or fail. Think of it as a type-safe container that holds either a successful value or an error — never both, and never neither.

```typescript
type Result<Data, Error> =
  | { success: true; data: Data }
  | { success: false; error: Error };
```

Instead of throwing exceptions or returning `null`/`undefined` for errors, Result types make success and failure explicit parts of your type system, forcing you to handle both cases.

## Why Use Result Types?

The Result type embraces the "errors as values" philosophy, treating errors as data rather than exceptional control flow. Let's explore this concept through a simple division function to see how Result types improve error handling.

### Errors Visible in Type Signatures

Traditional functions often hide potential errors in their type signatures. When you see a function like `divide(a: number, b: number): number`, TypeScript tells you it returns a number, but it doesn't tell you that it might throw an exception.

**Traditional approach:**

```typescript twoslash
function divide(a: number, b: number) {
  if (b === 0) {
    // Hidden error - not visible in type signature
    throw new Error('division_by_zero');
  }
  return a / b;
}

// TypeScript says this returns `number`, but it can actually throw
const result = divide(10, 0); // 💥 Runtime exception
//    ^?
```

**Result type approach:**

```typescript twoslash
import { ok, err } from '@uni-ts/result';

function safeDivide(a: number, b: number) {
  return b === 0 ? err('division_by_zero') : ok(a / b);
}

// TypeScript correctly shows it can return a number or an error.
const result = safeDivide(10, 0);
//    ^?
```

### Predictable Control Flow

Now let's see what happens when we use these functions in a larger calculation. With traditional exceptions, your program flow can be interrupted at any point, making it hard to reason about what will actually execute.

**Traditional approach:**

```typescript twoslash
function divide(a: number, b: number) {
  if (b === 0) {
    throw new Error('division_by_zero');
  }
  return a / b;
}

// ---cut---
function calculate() {
  const x = divide(10, 2); // 5 - works fine
  const y = divide(8, 0); // 💥 Throws exception, disrupts the flow

  return { x, y }; // This line never executes
}
```

**Result type approach:**

```typescript twoslash
import { ok, err } from '@uni-ts/result';

function safeDivide(a: number, b: number) {
  return b === 0 ? err('division_by_zero') : ok(a / b);
}

// ---cut---
function calculate() {
  const x = safeDivide(10, 2); // Ok<number>
  const y = safeDivide(8, 0); // Err<'division_by_zero'>

  // No exceptions thrown, no flow interruption
  return { x, y };
}
```

### Required Error Handling

Returning `x` and `y` doesn't actually calculate anything. Let's return a sum of those numbers. In traditional approach, you don't see the errors until runtime so you may forget to handle them. With Result types, TypeScript will prevent you from accessing the data until you ensure no error has occurred.

**Traditional approach:**

```typescript twoslash
function divide(a: number, b: number) {
  if (b === 0) {
    throw new Error('division_by_zero');
  }
  return a / b;
}

// ---cut---
function calculate() {
  // Easy to forget error handling - code compiles fine
  const x = divide(10, 2);
  const y = divide(8, 0); // 💥 Runtime exception

  return x + y; // This line will never execute
}
```

**Result type approach:**

```typescript twoslash
// @errors: 2339
import { ok, err, isErr } from '@uni-ts/result';

function safeDivide(a: number, b: number) {
  return b === 0 ? err('division_by_zero') : ok(a / b);
}

// ---cut---
function calculate() {
  const xResult = safeDivide(10, 2);
  const yResult = safeDivide(8, 0);

  // We cannot access data without checking for errors
  return xResult.data + yResult.data;
}
```

```typescript twoslash
import { ok, err, isErr } from '@uni-ts/result';

function safeDivide(a: number, b: number) {
  return b === 0 ? err('division_by_zero') : ok(a / b);
}

// ---cut---
function calculate() {
  const xResult = safeDivide(10, 2);
  const yResult = safeDivide(8, 0);

  // Handle errors first
  if (isErr(xResult) || isErr(yResult)) {
    return 0;
  }

  // Then safely access the data
  return xResult.data + yResult.data;
}
```

### Explicit Error Information

Last but not least, let's handle possible errors from the `divide` function to see how it will look like in both approaches.

Traditional approach requires you to dig into implementation details or use `instanceof` checks to ensure you handle only the `divide` function exceptions (you may place more throwable functions in `try` block in the future).

With Result types, nothing changes from the previous example. You are already sure you're handling only errors from `divide` function. If you introduce more functions in the future they will come with their own Result return types so TypeScript will tell you if they can fail and how.

<!-- With Result types, you know exactly what errors are possible and where they come from, without needing to dig into implementation details or catch generic exceptions. -->

**Traditional approach:**

```typescript twoslash
function divide(a: number, b: number) {
  if (b === 0) {
    throw new Error('division_by_zero');
  }
  return a / b;
}

// ---cut---
function calculate() {
  try {
    const x = divide(10, 2);
    const y = divide(8, 0);

    // ... maybe some more functions

    return x + y;
  } catch (ex) {
    // What exception? From which function?
    // We need to inspect implementation or use instanceof checks
    // to ensure we handle only the `divide` function exceptions
    if (ex instanceof Error && ex.message === 'division_by_zero') {
      return 0;
    }

    // Re-throw in case of exceptions from other functions
    // (current ones or introduced in the future)
    throw ex;
  }
}
```

**Result type approach:**

```typescript twoslash
import { ok, err, isErr } from '@uni-ts/result';

function safeDivide(a: number, b: number) {
  return b === 0 ? err('division_by_zero') : ok(a / b);
}

// ---cut---
function calculate() {
  const xResult = safeDivide(10, 2);
  const yResult = safeDivide(8, 0);

  // We're sure exceptions come from `safeDivide` function
  if (isErr(xResult) || isErr(yResult)) {
    return 0;
  }

  // ... maybe some more functions
  // TypeScript will tell us if they can fail and how

  return xResult.data + yResult.data;
}
```

## Getting Started

Ready to start using Result types in your project? Check out the [Getting Started](/docs/result/getting-started) guide to learn how to install and use the `@uni-ts/result` package with practical examples and API documentation.
