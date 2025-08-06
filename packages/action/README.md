# @uni-ts/action

**Type-safe action pipelines with shared context**

The `@uni-ts/action` package provides a powerful and flexible way to create composable action pipelines. Chain middleware functions, share typed context, and handle errors gracefully with full TypeScript support.

## Installation

```bash
npm install @uni-ts/action
# or
yarn add @uni-ts/action
# or
pnpm add @uni-ts/action
```

## Quick Start

```typescript
import { createAction, next } from '@uni-ts/action';

// 1. Define your action pipeline
const getBlogPost = createAction<{ postId: string }>()
  // 2. Add middleware functions
  .with(({ input }) => {
    // Validation middleware
    const issues = validateInput(input);
    if (issues.length > 0) throw new Error('Invalid input');
    return next();
  })
  .with(async () => {
    // Authentication middleware
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');
    return next({ user });
  })
  // 3. Define the final action
  .do(async ({ input, ctx }) => {
    const post = await getPost({ postId: input.postId, userId: ctx.user.id });
    if (!post) throw new Error('Post not found');
    return post;
  });

// 4. Execute the action with error handling
try {
  const post = await getBlogPost({ postId: '456' });
  console.log('Success:', post);
} catch (error) {
  console.error('Failed:', error);
}
```

## Core Concepts

### Action Builder Pattern

Actions are built using a fluent API that chains middleware and concludes with a final action:

```typescript
const action = createAction<InputType>()
  .with(middleware1) // Optional middleware chain
  .with(middleware2) // Each middleware can throw, return a value, or call next()
  .with(middleware3) // Throwing or returning a value stops the pipeline
  .with(middleware4) // next() continues to the next middleware
  .do(finalAction); // The final action returns a value or throws
```

### Context Sharing

Use the `next()` helper to pass typed context between middleware and actions:

```typescript
const action = createAction()
  .with(() => next({ user: { id: 1, name: 'John' } }))
  .with(({ ctx }) => next({ timestamp: Date.now() }))
  .do(({ ctx }) => {
    // ctx is fully typed: { user: { id: number, name: string }, timestamp: number }
    return `Hello ${ctx.user.name}! The time is: ${ctx.timestamp}`;
  });
```

### Error Handling

Middleware can throw errors to short-circuit the pipeline:

```typescript
const action = createAction<{ token: string }>()
  .with(({ input }) => {
    if (!input.token) {
      throw new Error('Missing token'); // Pipeline stops here
    }
    return next({ validToken: true });
  })
  .do(() => 'Success!'); // Only runs if middleware passes
```

## Key Features

### 🔒 Type Safety

Full TypeScript support with proper type inference throughout the pipeline:

```typescript
const action = createAction<{ age: number }>()
  .with(({ input }) => {
    // input.age is properly typed as number
    return next({ isAdult: input.age >= 18 });
  })
  .do(({ input, ctx }) => {
    // Both input and ctx are fully typed
    return { canVote: ctx.isAdult };
  });
```

### ⚡ Async Support

Seamlessly handle both synchronous and asynchronous operations:

```typescript
const fetchUserAction = createAction<{ userId: string }>()
  .with(async ({ input }) => {
    const user = await fetchUser(input.userId);
    if (!user) throw new Error('User not found');
    return next({ user });
  })
  .with(async ({ ctx }) => {
    const permissions = await fetchPermissions(ctx.user.id);
    return next({ permissions });
  })
  .do(async ({ ctx }) => {
    return await processUserData(ctx.user, ctx.permissions);
  });

// Returns Promise<ProcessedUserData>
try {
  const result = await fetchUserAction({ userId: '123' });
  console.log('Success:', result);
} catch (error) {
  console.error('Failed:', error);
}
```

### 🔄 Composable Middleware

Build reusable middleware functions:

```typescript
// Reusable authentication middleware
const authMiddleware = ({ input }: { input: { token: string } }) => {
  if (!isValidToken(input.token)) {
    throw new Error('Invalid token');
  }
  return next({ userId: extractUserId(input.token) });
};

// Reusable logging middleware
const logMiddleware = ({ input }: { input: unknown }) => {
  console.log('Action called with:', input);
  return next({ requestTime: Date.now() });
};

// Use in multiple actions
const userAction = createAction<{ token: string; data: unknown }>()
  .with(authMiddleware)
  .with(logMiddleware)
  .do(({ ctx, input }) => processUserData(ctx.userId, input.data));

const adminAction = createAction<{ token: string; action: string }>()
  .with(authMiddleware)
  .with(logMiddleware)
  .do(({ ctx, input }) => executeAdminAction(ctx.userId, input.action));
```

### 🛠 Custom Error Handling

Customize how unexpected exceptions are handled:

```typescript
const action = createAction({
  onThrow: (error) => {
    console.error('Action failed:', error);
    return null; // action will return null instead of throwing
  },
})
  .with(() => {
    throw new Error('Something went wrong');
  })
  .do(() => 'success');

const result = action(); // null
```

## Safe Actions (Result-returning)

For functional error handling with type-safe errors instead of exceptions, you can use the `createSafeAction()` from `@uni-ts/action/safe`. In order to use it, you need to install `@uni-ts/result` as a dependency.

```bash
npm install @uni-ts/result
# or
yarn add @uni-ts/result
# or
pnpm add @uni-ts/result
```

Safe (result-returning) actions are created similarly to default (throwing) actions, but you need to return `ok(value)` or `err(error)` from actions and middlewares instead of throwing or returning a value.

```typescript
import { createSafeAction, next } from '@uni-ts/action/safe';
import { ok, err, isOk } from '@uni-ts/result';

// Safe actions return Results instead of throwing
const getBlogPost = createSafeAction<{ postId: string }>()
  .with(({ input }) => {
    const issues = validateInput(input);
    if (issues.length > 0) return err('INVALID_INPUT');
    return next();
  })
  .with(async () => {
    const user = await getCurrentUser();
    if (!user) return err('UNAUTHORIZED');
    return next({ user });
  })
  .do(async ({ input, ctx }) => {
    const post = await getPost({ postId: input.postId, userId: ctx.user.id });
    if (!post) return err('POST_NOT_FOUND');
    return ok(post);
  });

// Handle results explicitly
const result = await getBlogPost({ postId: '456' });

if (isOk(result)) {
  console.log('Success:', result.data); // Post
} else {
  console.log('Error:', result.error); // 'INVALID_INPUT' | 'UNAUTHORIZED' | 'POST_NOT_FOUND'
}
```

### Key Differences

| Feature                | Default Actions           | Safe Actions                           |
| ---------------------- | ------------------------- | -------------------------------------- |
| **Import**             | `@uni-ts/action`          | `@uni-ts/action/safe`                  |
| **Function**           | `createAction()`          | `createSafeAction()`                   |
| **Error Handling**     | Throws exceptions         | Returns `Result<T, E>`                 |
| **Middleware Returns** | Value, `next()`, or throw | `ok(value)`, `err(error)`, or `next()` |
| **Action Returns**     | Value or throw            | `ok(value)` or `err(error)`            |
| **Dependencies**       | None                      | `@uni-ts/result`                       |

### When to Use Each

**Use Default Actions when:**

- Working with existing error-throwing codebases
- You prefer traditional try/catch error handling
- Integrating with frameworks that expect exceptions

**Use Safe Actions when:**

- You want functional error handling without exceptions
- Building systems where all errors should be explicit
- You prefer Result types for error management
