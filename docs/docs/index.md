# About the Project

Hey there! 👋

Welcome to **UniTS** — a collection of type-safe utilities that make TypeScript application development cleaner, safer, and more enjoyable.

## What is UniTS?

Think of UniTS as your TypeScript toolbox. Instead of reinventing the wheel every time you need to handle errors, validate data, or build complex logic, UniTS provides you with battle-tested utilities that work seamlessly together.

Each package in the UniTS family focuses on solving a specific problem you face every day as a TypeScript developer:

- **Tired of try-catch blocks everywhere?**

  Use [`@uni-ts/result`](/docs/result/) for explicit error handling.

- **Struggling keeping your data in check?**

  Try [`@uni-ts/model`](/docs/model/) for type-safe data modeling.

- **Dealing with nested function calls?**

  Check out [`@uni-ts/composition`](/docs/composition/) for clean pipelines.

- **Building complex business logic?**

  Explore [`@uni-ts/action`](/docs/action/) for composable workflows.

## Why Choose UniTS?

**🛡️ Type Safety First** — Every utility leverages TypeScript's type system to catch errors at compile time, not runtime.

**🧩 Modular Design** — Install only what you need. Each package works independently but plays nicely with others.

**📚 Proven Patterns** — Based on battle-tested concepts from functional programming that have stood the test of time.

**⚡ Zero Dependencies** — Lightweight packages that won't bloat your bundle size.

**🔄 Works Together** — When you need multiple packages, they integrate seamlessly.

## The UniTS Family

### [@uni-ts/result](/docs/result/) — Handle Errors Like a Pro

Stop letting errors crash your app unexpectedly. Make them visible in your function signatures and handle them gracefully.

```typescript
import { ok, err, isOk } from '@uni-ts/result';

function divide(a: number, b: number) {
  return b === 0 ? err('Cannot divide by zero') : ok(a / b);
}

const result = divide(10, 2);
if (isOk(result)) {
  console.log('Answer:', result.data); // 5
}
```

**Perfect for:** API calls, file operations, user input validation, and any other operation that might fail.

### [@uni-ts/model](/docs/model/) — Model Your Data and Behavior with Confidence

Create type-safe data models with related utilities attached. No more guessing if your data is valid or what you can do with it — let TypeScript tell you.

```typescript
import { createModel, type InferModelType } from '@uni-ts/model';
import { z } from 'zod';

type Email = InferModelType<typeof Email>;
const Email = createModel(z.string().email().brand('Email'));

// TypeScript ensures only valid emails can be passed to this function
function sendWelcomeEmail(email: Email) {}

const input = document.querySelector('input[type="email"]')?.value;
if (Email.is(input)) {
  sendWelcomeEmail(input); // ✅ Safe to use
}
```

**Perfect for:** Form validation, API responses, configuration files, and all other data kinds in your project.

### [@uni-ts/composition](/docs/composition/) — Build Pipelines, Not Pyramids

Transform nested function calls into readable, left-to-right pipelines that are easy to understand and modify.

```typescript
import { flow } from '@uni-ts/composition';

const processUserInput = flow(
  validateInput,
  normalizeData,
  saveToDatabase,
  sendNotification,
  formatResponse
);

const result = await processUserInput(userInput);
```

**Perfect for:** Data transformation, processing pipelines, or any time you have multiple steps that depend on each other.

### [@uni-ts/action](/docs/action/) — Composable Business Logic

Build complex workflows from simple, reusable pieces. Perfect for moving repeatable code like authentication, validation, or logging out of your business logic.

```typescript
import { createAction, next } from '@uni-ts/action';

const createPost = createAction<{ title: string; content: string }>()
  .with(validateInput)
  .with(authenticateUser)
  .with(checkPermissions)
  .do(async ({ input, ctx }) => {
    return await savePost({ ...input, userId: ctx.user.id });
  });
```

**Perfect for:** Complex business workflows, API handlers, or any operation that needs multiple processing steps with shared context.

## Getting Started

Pick the package that solves your current pain point. Each of them comes with detailed documentation, examples, and TypeScript support out of the box. Start with one, and add others as you need them — they're designed to work beautifully together.

Happy coding! 🚀
