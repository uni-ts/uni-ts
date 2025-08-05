# @uni-ts/result

**Type-safe error handling**

The `@uni-ts/result` package will help you handle errors in a more predictable way. Instead of throwing exceptions that can be missed or forgotten, Result types make error handling explicit and visible in your function signatures.

## What's a Result?

A Result represents an operation that can either succeed with some data or fail with an error. It's a simple object with a `success` property that tells you which case you're dealing with:

```typescript
interface Ok<T> {
  success: true;
  data: T;
}

interface Err<E> {
  success: false;
  error: E;
}

type Result<T, E> = Ok<T> | Err<E>;
```

This pattern is especially helpful in TypeScript because the compiler can verify that you've handled both success and error cases.

## A Quick Example

Here's how error handling typically works with exceptions:

```typescript
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

// Easy to forget error handling!
const value = divide(10, 0);
console.log(value);

try {
  doSomething(value);
  doSomethingElse(value);
} catch (ex) {
  // What type of exceptions are possible here?
}
```

With Results, error handling becomes part of the function signature:

```typescript
import type { Result } from '@uni-ts/result';
import { ok, err, isOk } from '@uni-ts/result';

function divide(a: number, b: number): Result<number, string> {
  return b === 0 ? err('cannot_divide_by_zero') : ok(a / b);
}

const result = divide(10, 0);

// TypeScript forces us to check if we goe an error or not
if (isOk(result)) {
  // TypeScript knows this is a number
  console.log('Result:', result.data);
} else {
  // TypeScript knows this is a "cannot_divide_by_zero"
  console.error('Error:', result.error);
}
```

The main difference? You can't accidentally ignore errors anymore and you know exactly what type of errors to expect.

## Installation

```bash
npm install @uni-ts/result
# or
yarn add @uni-ts/result
# or
pnpm add @uni-ts/result
```

## Basic Usage

### Creating Results

```typescript
import { ok, err } from '@uni-ts/result';

// When things go well
const success = ok('Hello, world!');
// Returns: { success: true, data: "Hello, world!" }

// When things go wrong
const failure = err('Something went wrong');
// Returns: { success: false, error: "Something went wrong" }
```

### Checking What You Got

```typescript
import { isOk, isErr } from '@uni-ts/result';

if (isOk(result)) {
  // TypeScript knows result.data type
  console.log('The answer is:', result.data);
} else {
  // TypeScript knows result.error type
  console.error('Calculation failed:', result.error);
}
```

### Getting Values Out

When you need the actual value, not the Result wrapper:

```typescript
import { unwrapOr, unwrapOrThrow, unwrapOrNull, match } from '@uni-ts/result';

// Provide a fallback value if it's an error
const value = unwrapOr(result, 'default value');

// Throw an exception if it's an error
const value2 = unwrapOrThrow(result);

// Return null if it's an error
const value3 = unwrapOrNull(result);

// Handle both cases explicitly
const message = match(
  result,
  (data) => `Got: ${data}`,
  (error) => `Failed: ${error}`
);
```

### Moving from throwable to Result

```typescript
import { fromThrowable, tryCatch } from '@uni-ts/result';

function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

// Create a safe version of a throwable function
const safeDivide = fromThrowable(divide, 'cannot_divide_by_zero');
// (a: number, b: number) => Result<number, 'cannot_divide_by_zero'>

// Invoke a throwable function safely
const result = tryCatch(() => divide(10, 0), 'cannot_divide_by_zero');
// Result<number, 'cannot_divide_by_zero'>
```

### Moving from Result to throwable

```typescript
import { toThrowable } from '@uni-ts/result';

function divide(a: number, b: number): Result<number, string> {
  return b === 0 ? err('cannot_divide_by_zero') : ok(a / b);
}

// Create a throwable version of a Result-returning function
const throwingDivide = toThrowable(divide);
// (a: number, b: number) => number
```

## Working with Async Operations

All the functions in this library work with both sync and async functions.

```typescript
import { fromThrowable } from '@uni-ts/result';

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

const safeFetchUser = fromThrowable(fetchUser, 'failed_to_fetch_user');
// (id: string) => Promise<Result<User, 'failed_to_fetch_user'>>

const user1 = await safeFetchUser('123');
// User | null

const user2 = await unwrapOrNull(safeFetchUser('123'));
// User | null

const userResult = await tryCatch(fetchUser('123'), 'failed_to_fetch_user');
// Result<User, 'failed_to_fetch_user'>

const user3 = match(
  userResult,
  (user) => user,
  () => ({ name: 'unknown' })
);
// User | { name: 'unknown' }
```

## Different Ways to Use the API

### Functional Style

The library provides a set of functions allowing to create type-safe pipelines in a functional style.

```typescript
import { flow } from '@uni-ts/composition';
import { ok, err, mapOk, mapErr, match } from '@uni-ts/result/fp';

const result = flow(
  (x: number) => (x === 0 ? err('division_by_zero') : ok(100 / x)),
  mapOk((x) => `The answer is ${x}`),
  mapErr((error) => `Processing failed: ${error}`),
  match(
    (data) => data,
    (error) => error
  )
); // (arg: number) => "The answer is ${number}" | "Processing failed: division_by_zero"
```

### Builder Style

As an alternative to the functional style, the library also provides a builder-style API.

```typescript
import { result } from '@uni-ts/result/builder';

const processed = result((x: number) =>
  x === 0 ? err('division_by_zero') : ok(100 / x)
)
  .mapOk((x) => `The answer is ${x}`)
  .mapErr((error) => `Processing failed: ${error}`)
  .match(
    (data) => data,
    (error) => error
  );
// (arg: number) => "The answer is ${number}" | "Processing failed: division_by_zero"
```
