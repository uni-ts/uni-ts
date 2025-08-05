# UniTS

**A collection of type-safe utilities to make your TypeScript projects cleaner, safer, and more composable.**

UniTS provides essential building blocks for modern TypeScript applications. Each package focuses on a specific aspect of type-safe development, from error handling to data validation and function composition.

## 🎯 Why UniTS?

- **🛡️ Type Safety First**: Every utility is designed with TypeScript's type system in mind.
- **🧩 Modular Design**: Install only what you need - each package works independently.
- **📚 Standard Patterns**: Based on proven patterns from functional programming languages.
- **⚡ Zero Dependencies**: Lightweight packages with minimal overhead.
- **🔄 Interoperable**: Packages work seamlessly together when needed.

## 📦 Packages

### [@uni-ts/result](./packages/result/README.md) - Type-safe Error Handling

Replace try-catch blocks with explicit error handling using Result types. Make errors visible in your function signatures and handle them safely.

```typescript
import { ok, err, isOk } from '@uni-ts/result';

function divide(a: number, b: number): Result<number, string> {
  return b === 0 ? err('cannot_divide_by_zero') : ok(a / b);
}

const result = divide(10, 2);
if (isOk(result)) {
  console.log('Success:', result.data); // 5
}
```

**Use when you want to:**

- Handle errors explicitly without exceptions.
- Make error cases visible in function signatures.
- Create more predictable and testable code.

---

### [@uni-ts/model](./packages/model/README.md) - Type-safe Data Modeling

Create type-safe data models with validation using Standard Schema library of your choice (e.g. Zod, Valibot, ArkType). Define what your data is and what it can do.

```typescript
import { createModel, type InferModelType } from '@uni-ts/model';
import { z } from 'zod';

type Email = InferModelType<typeof Email>;
const Email = createModel(z.string().email().brand('Email'));

function sendEmail(email: Email) {
  // ...
}

const userInput = document.querySelector('input[name="email"]').value;

if (Email.is(userInput)) {
  sendEmail(userInput);
} else {
  console.error('Invalid email');
}
```

**Use when you want to:**

- Validate data at runtime with compile-time type safety.
- Create reusable data models with consistent validation.
- Work with APIs, forms, or external data sources.

---

### [@uni-ts/composition](./packages/composition/README.md) - Function Composition

Build complex data transformations from simple, reusable functions. Create clear, readable pipelines that handle both sync and async operations.

```typescript
import { flow } from '@uni-ts/composition';

const getProductFinalPrice = flow(
  getProductById,
  getProductBasePrice,
  applyDiscount(0.1),
  applyTax(0.08),
  roundPrice,
  formatPrice
);

const finalPrice = await getProductFinalPrice('1');
```

**Use when you want to:**

- Replace nested function calls with readable pipelines.
- Create reusable transformation functions.
- Handle complex async operations cleanly.

---

### [@uni-ts/action](./packages/action/README.md) - Composable Action Pipelines

Build complex workflows from simple actions with shared context and type-safe error handling. Perfect for business logic, API handlers, and data processing.

```typescript
import { createAction, next } from '@uni-ts/action';
import { ok, err } from '@uni-ts/result';

const getUserPost = createAction<{ postId: string }>()
  .with(async () => {
    const user = await getCurrentUser();
    return user ? next({ user }) : err('UNAUTHORIZED');
  })
  .do(async ({ input, ctx }) => {
    const post = await getPost(input.postId, ctx.user.id);
    return post ? ok(post) : err('POST_NOT_FOUND');
  });

const result = await getUserPost({ postId: '123' });
```

**Use when you want to:**

- Build complex business logic with multiple steps.
- Create reusable middlewares and apply them to multiple actions.
- Share context between operations.

## 🚀 Quick Start

### Choose Your Adventure

**For type-safe error handling:**

```bash
npm install @uni-ts/result
```

**For data validation and modeling:**

```bash
npm install @uni-ts/model zod  # or any library following the standard schema
```

**For function composition and pipelines:**

```bash
npm install @uni-ts/composition
```

**For complex action workflows:**

```bash
npm install @uni-ts/action @uni-ts/result
```

## 📄 License

MIT © [Konrad Szwarc](https://github.com/KonradSzwarc)
