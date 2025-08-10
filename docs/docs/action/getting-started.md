# Getting Started

Ready to use Actions in your project? This guide will walk you through installation, basic usage, and common patterns to help you build composable action pipelines quickly.

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

You can install `@uni-ts/action` using your preferred package manager:

::: code-group

```sh [npm]
$ npm add @uni-ts/action
```

```sh [pnpm]
$ pnpm add @uni-ts/action
```

```sh [yarn]
$ yarn add @uni-ts/action
```

```sh [bun]
$ bun add @uni-ts/action
```

:::

If you want to handle errors using Result types instead of throwing exceptions, you can also install `@uni-ts/result`:

::: code-group

```sh [npm]
$ npm add @uni-ts/action @uni-ts/result
```

```sh [pnpm]
$ pnpm add @uni-ts/action @uni-ts/result
```

```sh [yarn]
$ yarn add @uni-ts/action @uni-ts/result
```

```sh [bun]
$ bun add @uni-ts/action @uni-ts/result
```

:::

## Your First Action

As you saw in the [Introduction](./index.md), an Action is a composable pipeline that combines middleware functions with a final action. Let's see this on a simple example.

```typescript twoslash
import { createAction, next } from '@uni-ts/action';

// Create a simple greeting action
const greetUser = createAction<{ name: string; isNew?: boolean }>()
  .with(({ input }) => {
    // Validation middleware
    if (!input.name.trim()) {
      throw new Error('Name cannot be empty');
    }
    return next();
  })
  .with(({ input }) => {
    // Context enrichment middleware
    const greeting = input.isNew ? 'Hello, ' : 'Welcome back,';
    return next({ greeting });
  })
  .do(({ input, ctx }) => {
    // Final action
    return `${ctx.greeting} ${input.name}!`;
  });

// Execute the action
const result = greetUser({ name: 'Alice', isNew: false });
console.log(result); // "Welcome back, Alice!"
```

## Building Action Pipelines

Actions are built using a fluent API pattern with three key components.

### 1. Action Builder

Start with `createAction()` and optionally specify the input type:

```typescript twoslash
import { createAction } from '@uni-ts/action';

// Action with no input
const simpleAction = createAction();

// Action with typed input
const typedAction = createAction<{ userId: string; data: unknown }>();
```

### 2. Middleware Chain

Use `.with()` to add middleware functions. Each middleware can:

- **Continue the pipeline** by calling `next()` (empty, or with context data to pass further)
- **Short-circuit the pipeline** by returning a value or throwing an exception

```typescript twoslash
import { createAction, next } from '@uni-ts/action';

const action = createAction<{ token: string; amount: number }>()
  .with(({ input }) => {
    // Middleware can throw to stop the pipeline
    if (!input.token) {
      throw new Error('Token is required');
    }
    return next(); // Continue without adding context
  })
  .with(({ input }) => {
    // Middleware can return early to short-circuit
    if (input.amount === 0) {
      return { success: false, reason: 'Zero amount' };
    }
    return next({ validAmount: input.amount }); // Continue with context
  })
  .with(({ ctx }) => {
    // Middleware can access previous context
    const fee = ctx.validAmount * 0.1;
    return next({ fee });
  });
```

### 3. Final Action

Use `.do()` to define what happens when all middleware passes. The main difference between `.with()` and `.do()` is that

- `.with()` can return the `next()` function to continue the pipeline, while `.do()` cannot.
- `.with()` continues the pipeline (returns a builder), while `.do()` executes the action (returns a function).

```typescript twoslash
import { createAction, next } from '@uni-ts/action';

const processPayment = createAction<{ token: string; amount: number }>()
  .with(({ input }) => {
    if (!input.token) {
      throw new Error('Token required');
    }
    if (input.amount <= 0) {
      return { success: false, error: 'Invalid amount' } as const;
    }
    return next({ validatedAmount: input.amount });
  })
  .do(({ input, ctx }) => {
    // This only runs if middleware passes
    return {
      success: true,
      transactionId: Math.random().toString(36),
      originalAmount: input.amount,
      validatedAmount: ctx.validatedAmount,
    } as const;
  });
```

## Context Sharing

One of the most powerful features of actions is the ability to share typed context between middleware functions and the final action.

### Building Context Step by Step

Each middleware can add data to the context using `next()`:

```typescript twoslash
declare function fetchUser(id: string): Promise<{ id: string; name: string }>;
declare function fetchPermissions(userId: string): Promise<string[]>;
// ---cut---
import { createAction, next } from '@uni-ts/action';

const userAction = createAction<{ userId: string }>()
  .with(async ({ input }) => {
    const user = await fetchUser(input.userId);
    return next({ user }); // Add user to context
  })
  .with(async ({ ctx }) => {
    const permissions = await fetchPermissions(ctx.user.id);
    return next({ permissions }); // Add permissions to context
  })
  .with(({ ctx }) => {
    const canEdit = ctx.permissions.includes('edit');
    return next({ canEdit }); // Add computed value to context
  })
  .do(({ ctx }) => {
    // All context is available and properly typed
    return {
      user: ctx.user,
      permissions: ctx.permissions,
      canEdit: ctx.canEdit,
    };
  });
```

### Context Overrides

Each new context object is merged with the previous one. You can override the previous context by returning a new object with the same keys.

```typescript twoslash
import { createAction, next } from '@uni-ts/action';

const action = createAction()
  .with(() => next({ data: 'data' }))
  .with(({ ctx }) => next({ data: ctx.data.toUpperCase() }))
  .with(({ ctx }) => next({ data: ctx.data + ' ' + ctx.data }))
  .do(({ ctx }) => ctx.data); // returns "DATA DATA"
```

## Async Operations

Actions work seamlessly with async functions. When any middleware or action returns a Promise, the entire action becomes async:

```typescript twoslash
declare function processData(data: unknown): string;
// ---cut---
import { createAction, next } from '@uni-ts/action';

const asyncAction = createAction<{ url: string }>()
  .with(async ({ input }) => {
    // Async middleware
    const response = await fetch(input.url);
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    return next({ json: await response.json() });
  })
  .do(({ ctx }) => processData(ctx.json));

// The action returns a Promise
const result = await asyncAction({ url: 'https://api.example.com/data' });
```

You can mix sync and async middleware freely - the action will automatically become async when needed.

## Error Handling

Actions provide several approaches to handle errors, from simple exceptions to custom error handling strategies.

### Basic Exception Handling

By default, any thrown error stops the pipeline and gets wrapped in a `ThrownActionError`:

```typescript twoslash
import { createAction, next, ThrownActionError } from '@uni-ts/action';

const action = createAction<{ value: number }>()
  .with(({ input }) => {
    if (input.value < 0) {
      throw new Error('Negative values not allowed');
    }
    return next();
  })
  .do(({ input }) => input.value * 2);

try {
  const result = action({ value: -5 });
} catch (error) {
  if (error instanceof ThrownActionError) {
    console.log('Action failed:', error.message); // "Negative values not allowed"
    console.log('Original error:', error.cause);
  }
}
```

### Custom Error Handling

You can customize how exceptions are handled by providing an `onThrow` function:

```typescript twoslash
import { createAction, next } from '@uni-ts/action';

const actionWithCustomError = createAction({
  onThrow: (error) => {
    console.error('Action failed:', error);
    // Return instead of throwing
    return { success: false, error: String(error) };
  },
})
  .with(() => {
    throw new Error('Something went wrong');
  })
  .do(() => ({ success: true, data: 'result' }));

const result = actionWithCustomError();
// Returns: { success: false, error: "Error: Something went wrong" }
```

## Safe Actions with Result Types

For functional error handling without exceptions, you can utilize safe actions that return Result types instead of throwing.

### Installing Result Support

Safe actions require the `@uni-ts/result` package:

```sh
npm add @uni-ts/result
```

### Creating Safe Actions

Safe actions differ from the regular ones mostly by their return type. While regular actions return values and throw exceptions, safe actions return `ok(value)` or `err(error)` values.

```typescript twoslash
import { createSafeAction, next } from '@uni-ts/action/safe';
import { ok, err, isOk } from '@uni-ts/result';

const safeAction = createSafeAction<{ value: number }>()
  .with(({ input }) => {
    if (input.value < 0) {
      // Return error instead of throwing
      return err('negative_value');
    }
    // next() function works as usual
    return next();
  })
  .with(({ input }) => next({ doubled: input.value * 2 }))
  .do(({ ctx }) => {
    // Return ok() instead of a raw value
    return ok(ctx.doubled);
  });

// Returns the Result type
const result = safeAction({ value: 10 });

if (isOk(result)) {
  console.log('Success:', result.data); // 20
} else {
  console.log('Error:', result.error); // 'negative_value'
}
```

### Safe vs Regular Actions

| Feature                | Regular Actions           | Safe Actions                           |
| ---------------------- | ------------------------- | -------------------------------------- |
| **Dependencies**       | None                      | `@uni-ts/result`                       |
| **Import**             | `@uni-ts/action`          | `@uni-ts/action/safe`                  |
| **Creator**            | `createAction()`          | `createSafeAction()`                   |
| **Error Handling**     | Throws exceptions         | Returns `err(error)`                   |
| **Middleware Returns** | Value, `next()`, or throw | `ok(value)`, `err(error)`, or `next()` |
| **Action Returns**     | Value or throw            | `ok(value)` or `err(error)`            |
