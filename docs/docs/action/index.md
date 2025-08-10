# Introduction

:::info
This is an introduction to the **Action concept** itself. For package documentation, see the [Getting Started](/docs/action/getting-started) guide.
:::

## What is an Action?

An Action is a composable pipeline that combines multiple middleware functions with a final action function. Think of it as a type-safe way to build complex operations by chaining smaller, focused functions together — each handling a specific concern like validation, authentication, logging, or business logic.

```typescript twoslash
declare function getSession(): Promise<{ id: string; name: string }>;
declare function chargeCard(
  userId: string,
  amount: number
): Promise<{ transactionId: string }>;
// ---cut---
import { createAction, next } from '@uni-ts/action';

type Input = { amount: number };

const processPayment = createAction<Input>()
  .with(validateInput)
  .with(authenticate)
  .do(async ({ input, ctx }) => chargeCard(ctx.user.id, input.amount));

function validateInput({ input }: { input: Input }) {
  if (input.amount <= 0) throw new Error('invalid_amount');
  return next();
}

async function authenticate({ input }: { input: Input }) {
  const user = await getSession();
  return next({ user });
}
```

Actions provide a structured way to organize complex operations while keeping each step focused, testable, and reusable.

## Why Use Actions?

Actions solve common problems you encounter when building complex applications. Let's explore these challenges and how actions address them.

### Scattered Cross-cutting Concerns

In traditional applications, concerns like validation, authentication, and logging are often scattered throughout your codebase, making them hard to maintain and test.

```typescript twoslash
declare function getCurrentUser(): Promise<{ id: string; name: string } | null>;
declare function createPostInDB(data: object): Promise<{ id: string }>;
declare function updatePostInDB(data: object): Promise<{ id: string }>;
// ---cut---
type BlogPost = { id: string; title: string; content: string };

// Every function handles its own validation, auth, logging
async function createPost(data: Omit<BlogPost, 'id'>) {
  // Validation
  if (data.title.length < 3 || data.content.length < 10) {
    throw new Error('Invalid data');
  }

  // Authentication
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Logging
  console.log(`User ${user.id} creating post`);

  // Finally, the actual business logic
  const post = await createPostInDB({ ...data, userId: user.id });
  return post;
}

async function updatePost(data: BlogPost) {
  // Same validation
  if (data.title.length < 3 || data.content.length < 10) {
    throw new Error('Invalid data');
  }

  // Same authentication
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Same logging
  console.log(`User ${user.id} updating post ${data.id}`);

  // Business logic, that's different
  const post = await updatePostInDB({ ...data, userId: user.id });
  return post;
}
```

Actions allow you to move repeated logic to reusable middleware functions and focus on the business logic.

```typescript twoslash
declare function getCurrentUser(): Promise<{ id: string; name: string } | null>;
declare function createPostInDB(data: object): Promise<{ id: string }>;
declare function updatePostInDB(data: object): Promise<{ id: string }>;
// ---cut---
import { createAction, next } from '@uni-ts/action';

type BlogPost = { id: string; title: string; content: string };

// Actions compose these reusable pieces
const createPost = createAction<Omit<BlogPost, 'id'>>()
  .with(validateData)
  .with(authenticate)
  .with(({ ctx }) => log(`User ${ctx.user.id} creating post`))
  .do(async ({ input, ctx: { user } }) => {
    const post = await createPostInDB({ ...input, userId: user.id });
    return post;
  });

const updatePost = createAction<BlogPost>()
  .with(validateData)
  .with(authenticate)
  .with(({ input, ctx: { user } }) =>
    log(`User ${user.id} updating post ${input.id}`)
  )
  .do(async ({ input, ctx: { user } }) => {
    const post = await updatePostInDB({ ...input, userId: user.id });
    return post;
  });

function validateData({ input }: { input: Omit<BlogPost, 'id'> }) {
  if (input.title.length < 3 || input.content.length < 10) {
    throw new Error('Invalid data');
  }
  return next();
}

async function authenticate() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return next({ user });
}

function log(data: string) {
  console.log(data);
  return next();
}
```

### Error Handling Complexity

Complex operations often require different error handling strategies at different steps. This leads to multiple try-catch blocks and need to define additional variables to get the values out of them.

**Traditional approach:**

```typescript twoslash
type UserInput = { name: string; email: string };
type DbUser = { id: string; name: string; email: string };
declare function validateInput(data: unknown): UserInput;
declare function createUserInDB(user: UserInput): Promise<DbUser>;
declare function sendWelcomeEmail(email: string): Promise<void>;
// ---cut---

async function register(input: unknown) {
  let userInput: UserInput;
  try {
    userInput = validateInput(input);
  } catch (error) {
    throw new Error(`Validation error: ${error}`);
  }

  let user: DbUser;
  try {
    user = await createUserInDB(userInput);
  } catch (error) {
    throw new Error(`Database error: ${error}`);
  }

  let emailSent = false;
  try {
    await sendWelcomeEmail(user.email);
    emailSent = true;
  } catch (error) {
    console.warn('Failed to send welcome email:', error);
  }

  return { user, emailSent };
}
```

**Action approach:**

```typescript twoslash
type UserInput = { name: string; email: string };
type DbUser = { id: string; name: string; email: string };
declare function validateUserData(data: unknown): UserInput;
declare function createUserInDB(user: UserInput): Promise<DbUser>;
declare function sendWelcomeEmail(email: string): Promise<void>;
// ---cut---
import { createAction, next } from '@uni-ts/action';

const register = createAction<unknown>()
  .with(({ input }) => {
    try {
      return next({ userInput: validateUserData(input) });
    } catch (error) {
      throw new Error(`Validation error: ${error}`);
    }
  })
  .with(async ({ ctx }) => {
    try {
      return next({ user: await createUserInDB(ctx.userInput) });
    } catch (error) {
      throw new Error(`Database error: ${error}`);
    }
  })
  .with(async ({ ctx }) => {
    try {
      await sendWelcomeEmail(ctx.user.email);
      return next({ emailSent: true });
    } catch (error) {
      console.warn('Failed to send welcome email:', error);
      return next({ emailSent: false });
    }
  })
  .do(({ ctx }) => {
    return { user: ctx.user, emailSent: ctx.emailSent };
  });
```

### Testing Difficulties

Testing complex operations with multiple concerns mixed together is challenging. You often need to mock multiple dependencies and set up complex scenarios. With actions, each middleware function can be tested independently, and you can easily test different combinations.

```typescript twoslash
import { createAction, next } from '@uni-ts/action';

// Each middleware is easily testable in isolation
const validateInput = ({ input }: { input: { age: number } }) => {
  if (input.age < 0) throw new Error('Invalid age');
  return next();
};

// Test the validation middleware independently
// validateInput({ input: { age: -1 } }); // throws Error
// validateInput({ input: { age: 25 } }); // returns next()

// Actions can be tested with different middleware combinations
const isAdultAction = createAction<{ age: number }>()
  .with(validateInput)
  .do(({ input }) => input.age >= 18);

// Easy to test the complete pipeline
// isAdultAction({ age: 25 }); // true
// isAdultAction({ age: -1 }); // throws Error
```

## Getting Started

Ready to start using Actions in your project? Check out the [Getting Started](/docs/action/getting-started) guide to learn how to install and use the `@uni-ts/action` package with practical examples.
