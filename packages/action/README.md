# @uni-ts/action

**Type-safe action pipelines with shared context**

The `@uni-ts/action` package provides a powerful and flexible way to create composable action pipelines. Chain middleware functions, share typed context, and handle errors gracefully with full TypeScript support.

## Installation

```bash
npm install @uni-ts/action @uni-ts/result
# or
yarn add @uni-ts/action @uni-ts/result
# or
pnpm add @uni-ts/action @uni-ts/result
```

## Quick Start

```typescript
import { createAction, next } from '@uni-ts/action';
import { ok, err, unwrapOr } from '@uni-ts/result';

// 1. Define your action pipeline
const getBlogPost = createAction<{ postId: string }>()
  // 2. Add middleware functions
  .with(({ input }) => {
    // Validation middleware
    const issues = validateInput(input);
    if (issues.length > 0) return err('INVALID_INPUT');
    return next();
  })
  .with(async () => {
    // Authentication middleware
    const user = await getCurrentUser();
    if (!user) return err('UNAUTHORIZED');
    return next({ user });
  })
  // 3. Define the final action
  .do(async ({ input, ctx }) => {
    const post = await getPost({ postId: input.postId, userId: ctx.user.id });
    if (!post) return err('POST_NOT_FOUND');
    return ok(post);
  });

// 4. Execute the action
const result = await getBlogPost({ postId: '456' });
console.log(result); // Result<Post, 'INVALID_INPUT' | 'UNAUTHORIZED' | 'POST_NOT_FOUND'>

// 5. (Optional) Unwrap the result
const post = unwrapOr(result, (error) => {
  // ...handle the error
  return null;
});
console.log(post); // Post | null
```

## Core Concepts

### Action Builder Pattern

Actions are built using a fluent API that chains middleware and concludes with a final action:

```typescript
const action = createAction<InputType>()
  .with(middleware1) // Optional middleware chain
  .with(middleware2) // Each middleware can return ok(), err(), or next()
  .with(middleware3) // ok() and err() will stop the pipeline and return the result
  .with(middleware4) // next() will continue the pipeline
  .do(finalAction); // The final action can return ok() or err()
```

### Context Sharing

Use the `next()` helper to pass typed context between middleware and actions:

```typescript
const action = createAction()
  .with(() => next({ user: { id: 1, name: 'John' } }))
  .with(({ ctx }) => next({ timestamp: Date.now() }))
  .do(({ ctx }) => {
    // ctx is fully typed: { user: { id: number, name: string }, timestamp: number }
    return ok(`Hello ${ctx.user.name}! Time: ${ctx.timestamp}`);
  });
```

### Error Handling

Middleware can return errors to short-circuit the pipeline:

```typescript
const action = createAction<{ token: string }>()
  .with(({ input }) => {
    if (!input.token) {
      return err('MISSING_TOKEN'); // Pipeline stops here
    }
    return next({ validToken: true });
  })
  .do(() => ok('Success!')); // Only runs if middleware passes
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
    return ok({ canVote: ctx.isAdult && input.age >= 18 });
  });
```

### ⚡ Async Support

Seamlessly handle both synchronous and asynchronous operations:

```typescript
const fetchUserAction = createAction<{ userId: string }>()
  .with(async ({ input }) => {
    const user = await fetchUser(input.userId);
    return next({ user });
  })
  .with(async ({ ctx }) => {
    const permissions = await fetchPermissions(ctx.user.id);
    return next({ permissions });
  })
  .do(async ({ ctx }) => {
    const result = await processUserData(ctx.user, ctx.permissions);
    return ok(result);
  });

// Returns Promise<Result<...>>
const result = await fetchUserAction({ userId: '123' });
```

### 🔄 Composable Middleware

Build reusable middleware functions:

```typescript
// Reusable authentication middleware
const authMiddleware = ({ input }: { input: { token: string } }) => {
  if (!isValidToken(input.token)) {
    return err('INVALID_TOKEN');
  }
  return next({ userId: extractUserId(input.token) });
};

// Reusable logging middleware
const logMiddleware = ({ input }: { input: any }) => {
  console.log('Action called with:', input);
  return next({ requestTime: Date.now() });
};

// Use in multiple actions
const userAction = createAction<{ token: string; data: any }>()
  .with(authMiddleware)
  .with(logMiddleware)
  .do(({ ctx, input }) => ok(processUserData(ctx.userId, input.data)));

const adminAction = createAction<{ token: string; action: string }>()
  .with(authMiddleware)
  .with(logMiddleware)
  .do(({ ctx, input }) => ok(executeAdminAction(ctx.userId, input.action)));
```

### 🛠 Custom Error Handling

Customize how unexpected exceptions are handled:

```typescript
const action = createAction({
  onThrow: (error) => {
    console.error('Action failed:', error);
    return err('CUSTOM_ERROR');
  },
})
  .with(() => {
    throw new Error('Something went wrong');
  })
  .do(() => ok('success'));

const result = action(); // Err<'CUSTOM_ERROR'>
```
