# Getting Started

Ready to use Result types in your project? This guide will walk you through installation, basic usage, and common patterns to get you productive quickly.

## Installation

### Requirements

**TypeScript**: Version 4.5.0 or higher is required. We recommend using the latest stable version for the best experience and type safety.

**Configuration**: Make sure you have strict type checking enabled in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

### Install the Package

You can install `@uni-ts/result` using your preferred package manager:

::: code-group

```sh [npm]
$ npm add @uni-ts/result
```

```sh [pnpm]
$ pnpm add @uni-ts/result
```

```sh [yarn]
$ yarn add @uni-ts/result
```

```sh [bun]
$ bun add @uni-ts/result
```

:::

## Your First Result

As you saw in the [Introduction](./index.md), a Result is an object representing either success or error.

```typescript twoslash
function oneOf<const T extends unknown[]>(...values: T): T[number] {
  return values[Math.floor(Math.random() * values.length)];
}

// ---cut---
import { Ok, Err, Result } from '@uni-ts/result';

const okResult: Ok<number> = { success: true, data: 10 };
const errResult: Err<string> = { success: false, error: 'not_found' };
const result: Result<number, string> = oneOf(okResult, errResult);
```

Since we don't want to repeat ourselves when creating these objects manually, we can use the `ok` and `err` helper functions:

```typescript twoslash
function oneOf<const T extends unknown[]>(...values: T): T[number] {
  return values[Math.floor(Math.random() * values.length)];
}

// ---cut---
import { ok, err } from '@uni-ts/result';

const okResult = ok(10);
const errResult = err('not_found');
const result = oneOf(okResult, errResult);
```

> [!NOTE] 💡 Pro Tip
> The `ok` and `err` functions automatically infer types, making your code cleaner and more maintainable.

## From Throwing to Returning

Transforming your existing functions to be safe (returning Result instead of throwing) is straightforward. Just replace `throw` statements with `err()` and `return` statements with `ok()`.

::: code-group

```typescript twoslash [Unsafe (throwing)]
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
```

```typescript twoslash [Safe (returning)]
import { ok, err } from '@uni-ts/result';
// ---cut---
function applyDiscount(price: number, discount: number) {
  if (discount < 0 || discount > 1) {
    return err('invalid_discount');
  }

  if (price < 0) {
    return err('invalid_price');
  }

  return ok(price * (1 - discount));
}

// TypeScript knows this can fail and requires you to handle it
const result = applyDiscount(100, 1.5);
```

:::

### Working with External Functions

If a throwable function comes from a third-party library or is built-in, you can use `fromThrowable` to make it safe.

```typescript twoslash
import { fromThrowable } from '@uni-ts/result';

// Make JSON.parse safe for API responses
const safeParseJSON = fromThrowable(JSON.parse, 'invalid_json');

// Example API response data
const apiResponse = '{"user": "data"}';

// Unsafe: may throw at runtime
const userData = JSON.parse(apiResponse);

// Safe: returns a Result
const userResult = safeParseJSON(apiResponse);
```

For one-off operations where you don't need reusable safe functions, use the `tryCatch` utility.

```typescript twoslash
import fs from 'node:fs';

// ---cut---
import { tryCatch } from '@uni-ts/result';

const result = tryCatch(() => {
  const contents = fs.readFileSync('contacts.json', 'utf-8');
  return JSON.parse(contents) as unknown;
}, 'failed_to_read_contacts');
```

Now that you can create Results, let's see how to work with them.

## Getting Values Out

There are several ways to extract values from Results, each suited for different scenarios.

### Basic Pattern Matching

The most straightforward approach is checking what's inside the Result using `isOk` or `isErr`.

::: code-group

```typescript twoslash [Using isOk]
import { Result } from '@uni-ts/result';

declare function getUserSession(): Result<
  { id: string; name: string },
  'invalid_token' | 'session_expired'
>;
// ---cut---
import { isOk } from '@uni-ts/result';

const result = getUserSession();

if (isOk(result)) {
  console.log('Logged in as ', result.data.name);
} else {
  console.error('Session error: ', result.error);
}
```

```typescript twoslash [Using isErr]
import { Result } from '@uni-ts/result';

declare function getUserSession(): Result<
  { id: string; name: string },
  'invalid_token' | 'session_expired'
>;
// ---cut---
import { isErr } from '@uni-ts/result';

const result = getUserSession();

if (isErr(result)) {
  console.error('Session error: ', result.error);
} else {
  console.log('Logged in as ', result.data.name);
}
```

:::

### Destructuring with Tuples

You can extract both values using `toTuple`. It's helpful when you want to utilize each of them individually.

```typescript twoslash
import { Result } from '@uni-ts/result';

declare function getUserSession(): Result<
  { id: string; name: string },
  'invalid_token' | 'session_expired'
>;
// ---cut---
import { toTuple } from '@uni-ts/result';

const result = getUserSession();
const [data, error] = toTuple(result);

if (data) {
  console.log('Logged in as ', data.name);
} else {
  console.error('Session error: ', error);
}
```

### Unwrapping with Defaults

When you want immediate access to data and have sensible fallbacks, use the `unwrapOr` family of functions.

::: code-group

```typescript twoslash [unwrapOr]
import { Result } from '@uni-ts/result';

declare function getUserSession(): Result<
  { id: string; name: string },
  'invalid_token' | 'session_expired'
>;
// ---cut---
import { unwrapOr } from '@uni-ts/result';

const data = unwrapOr(getUserSession(), { id: '0', name: 'unknown' });

console.log('Logged in as ', data.name);
```

```typescript twoslash [unwrapOrNull]
import { Result } from '@uni-ts/result';

declare function getUserSession(): Result<
  { id: string; name: string },
  'invalid_token' | 'session_expired'
>;
// ---cut---
import { unwrapOrNull } from '@uni-ts/result';

const data = unwrapOrNull(getUserSession());

console.log('Logged in as ', data?.name);
```

```typescript twoslash [unwrapOrUndefined]
import { Result } from '@uni-ts/result';

declare function getUserSession(): Result<
  { id: string; name: string },
  'invalid_token' | 'session_expired'
>;
// ---cut---
import { unwrapOrUndefined } from '@uni-ts/result';

const data = unwrapOrUndefined(getUserSession());

console.log('Logged in as ', data?.name);
```

:::

### Advanced Pattern Matching

For complex scenarios where you need different behaviors for success and error cases, use the `match` function.

```typescript twoslash
import { Result } from '@uni-ts/result';

declare function getUserSession(): Result<
  { id: string; name: string },
  'invalid_token' | 'session_expired'
>;
// ---cut---
import { match } from '@uni-ts/result';

const user = match(
  getUserSession(),
  (data) => {
    console.log('Logged in as ', data.name);
    return data;
  },
  (error) => {
    console.error('Session error: ', error);
    return null;
  }
);
```

## Moving Back to Throwing

Sometimes you need to integrate with third-party libraries or legacy code that expects exceptions. You have two options for converting Results back to throwing functions.

### Making Safe Functions Throwable

Use `toThrowable` to convert a Result-returning function into one that throws.

```typescript twoslash
import { Result } from '@uni-ts/result';

declare function getUserSession(): Result<
  { id: string; name: string },
  'invalid_token' | 'session_expired'
>;
// ---cut---
import { toThrowable } from '@uni-ts/result';

const unsafeGetUserSession = toThrowable(getUserSession);
const user = unsafeGetUserSession();
```

### Throwing from Existing Results

Use `unwrapOrThrow` when you already have a Result and need to throw if it's an error.

```typescript twoslash
import { Result } from '@uni-ts/result';

declare function getUserSession(): Result<
  { id: string; name: string },
  'invalid_token' | 'session_expired'
>;
// ---cut---
import { unwrapOrThrow } from '@uni-ts/result';

const user = unwrapOrThrow(getUserSession());
```

> [!WARNING] ⚠️ Use with Caution
> Converting Results back to exceptions defeats the purpose of explicit error handling. Only do this when integrating with libraries that require it.

## Async Operations

All utilities in this library work seamlessly with async functions. When you pass anything async to a function, the result will become async as well.

```typescript twoslash
import { fromThrowable, match, tryCatch, unwrapOrNull } from '@uni-ts/result';

async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();
  return user as { id: string; name: string };
}

const safeFetchUser = fromThrowable(fetchUser, 'failed_to_fetch_user');

const user = safeFetchUser('1');
const userOrNull = unwrapOrNull(safeFetchUser('1'));
const userName = match(
  tryCatch(fetchUser('1'), 'failed_to_fetch_user'),
  (user) => user.name,
  () => 'unknown'
);
```

## Combining Safe Functions

The real power of Result types shines when you need to chain multiple operations that can fail. Instead of nested try-catch blocks, you get clean, type-safe composition with explicit error handling.

There are three approaches to combine safe functions. Choose the one that feels most comfortable.

### Simple Approach

This approach uses early returns to handle errors, keeping the main logic focused on the success path. It may seem verbose but it's very clear about what's happening at each step. We recommend to start with this approach if Result types are something new to you or your team.

```typescript twoslash
import { Result } from '@uni-ts/result';

type Todo = { id: string; userId: string; title: string };

declare function validateInput(
  data: unknown
): Result<{ title: string }, 'invalid_data'>;

declare function getUserSession(): Promise<
  Result<{ id: string; name: string }, 'invalid_token' | 'session_expired'>
>;

declare function insertTodo(
  data: Pick<Todo, 'userId' | 'title'>
): Promise<Result<Todo, 'db_connection_error'>>;

// ---cut---
import { isErr, ok, UnwrapOk, UnwrapErr } from '@uni-ts/result';

async function createTodo(data: unknown) {
  const input = validateInput(data);
  if (isErr(input)) return input;

  const session = await getUserSession();
  if (isErr(session)) return session;
  const { id: userId } = session.data;

  const todo = await insertTodo({ userId, ...input.data });
  if (isErr(todo)) return todo;

  return ok({ id: todo.data.id });
}

const todo = await createTodo({ title: 'Buy groceries' });

type Success = UnwrapOk<typeof todo>; // result Ok type
type Error = UnwrapErr<typeof todo>; // result Err type
```

### Functional Composition

You can also use a more functional style by composing functions together. This approach helps you to focus on only one path (success or error) at a time, handling the second one automatically.

> [!NOTE] 📦 Additional package required
> To use this approach, you need to install `@uni-ts/composition` or some other library that provides function composition utilities.

```typescript twoslash
import { Result } from '@uni-ts/result';

type Todo = { id: string; userId: string; title: string };

declare function validateInput(
  data: unknown
): Result<{ title: string }, 'invalid_data'>;

declare function getUserSession(): Promise<
  Result<{ id: string; name: string }, 'invalid_token' | 'session_expired'>
>;

declare function insertTodo(
  data: Pick<Todo, 'userId' | 'title'>
): Promise<Result<Todo, 'db_connection_error'>>;

// ---cut---
import { flow } from '@uni-ts/composition';
import { mapOk, UnwrapOk, UnwrapErr } from '@uni-ts/result/fp';

const createTodo = flow(
  validateInput,
  mapOk((input) =>
    flow(
      getUserSession,
      mapOk((session) => insertTodo({ userId: session.id, ...input })),
      mapOk((todo) => ({ id: todo.id }))
    )
  )
);

const todo = await createTodo({ title: 'Buy groceries' });

type Success = UnwrapOk<typeof todo>; // result Ok type
type Error = UnwrapErr<typeof todo>; // result Err type
```

### Result Chaining

If you prefer method chaining, you can use the result builder pattern. It provides a fluent API similar to Promise chains but with explicit error handling. It's similar to the functional approach, but operates on chainable objects.

```typescript twoslash
import { Result } from '@uni-ts/result';

type Todo = { id: string; userId: string; title: string };

declare function validateInput(
  data: unknown
): Result<{ title: string }, 'invalid_data'>;

declare function getUserSession(): Promise<
  Result<{ id: string; name: string }, 'invalid_token' | 'session_expired'>
>;

declare function insertTodo(
  data: Pick<Todo, 'userId' | 'title'>
): Promise<Result<Todo, 'db_connection_error'>>;

// ---cut---
import { result } from '@uni-ts/result/builder';
import { UnwrapOk, UnwrapErr } from '@uni-ts/result';

const createTodo = result(validateInput)
  .mapOk((input) =>
    result(getUserSession)
      .mapOk((session) => insertTodo({ userId: session.id, ...input }))
      .mapOk((todo) => ({ id: todo.id }))
      .create()
  )
  .create();

const todo = await createTodo({ title: 'Buy groceries' });

type Success = UnwrapOk<typeof todo>; // result Ok type
type Error = UnwrapErr<typeof todo>; // result Err type
```
