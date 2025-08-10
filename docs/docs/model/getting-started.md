# Getting Started

Ready to use Models in your project? This guide will walk you through installation, basic usage, and common patterns to get you productive quickly.

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

You can install `@uni-ts/model` using your preferred package manager:

::: code-group

```sh [npm]
$ npm add @uni-ts/model
```

```sh [pnpm]
$ pnpm add @uni-ts/model
```

```sh [yarn]
$ yarn add @uni-ts/model
```

```sh [bun]
$ bun add @uni-ts/model
```

:::

If you want to handle model validation errors safely without throwing exceptions, you can also install `@uni-ts/result`:

::: code-group

```sh [npm]
$ npm add @uni-ts/model @uni-ts/result
```

```sh [pnpm]
$ pnpm add @uni-ts/model @uni-ts/result
```

```sh [yarn]
$ yarn add @uni-ts/model @uni-ts/result
```

```sh [bun]
$ bun add @uni-ts/model @uni-ts/result
```

:::

## Your First Model

As you saw in the [Introduction](./index.md), a Model combines data structure and business logic in one place. Let's create your first model using Zod:

```typescript twoslash
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

const User = createModel(
  z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().int().min(0),
  })
);

// Get the TypeScript type
type User = InferModelOutput<typeof User>;
```

## Validation Methods

Models provide multiple ways to validate data, each suited for different scenarios:

### Type Guards with `is()`

Use `is()` to safely check unknown data and narrow its type:

```typescript twoslash
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

const User = createModel(
  z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().int().min(0),
  })
);

type User = InferModelOutput<typeof User>;
// ---cut---
function processUserData(data: unknown) {
  if (User.is(data)) {
    // TypeScript knows data is User type
    console.log(`Processing user: ${data.name}`);
    return data;
  }

  throw new Error('Invalid user data');
}
```

### Validation with `from()`

When you have data that should match your model's input type, use `from()`:

```typescript twoslash
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

const User = createModel(
  z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().int().min(0),
  })
);
// ---cut---
// from() expects an object with all required properties
const user = User.from({
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
});

console.log(user.name); // "John Doe"
```

### Validation with `cast()`

When working with completely unknown data (like API responses), use `cast()`:

```typescript twoslash
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

const User = createModel(
  z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().int().min(0),
  })
);
// ---cut---
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const data: unknown = await response.json();

  // cast() validates unknown data
  return User.cast(data);
}
```

> [!NOTE] 💡 Pro Tip
> Use `from()` when you're confident about the data structure, and `cast()` when working with external or unknown data sources.

## Working with Different Libraries

Models work with any validation library that supports the [Standard Schema interface](https://github.com/standard-schema/standard-schema). Here are examples with some popular libraries:

::: code-group

```typescript twoslash [Zod]
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

type Product = InferModelOutput<typeof Product>;
const Product = createModel(
  z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    category: z.enum(['electronics', 'clothing', 'books']),
  })
);
```

```typescript twoslash [Valibot]
import { createModel, type InferModelOutput } from '@uni-ts/model';
import * as v from 'valibot';

type Product = InferModelOutput<typeof Product>;
const Product = createModel(
  v.object({
    name: v.pipe(v.string(), v.minLength(1)),
    price: v.pipe(v.number(), v.minValue(0)),
    category: v.picklist(['electronics', 'clothing', 'books']),
  })
);
```

```typescript twoslash [ArkType]
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { type } from 'arktype';

type Product = InferModelOutput<typeof Product>;
const Product = createModel(
  type({
    name: 'string>0',
    price: 'number>0',
    category: "'electronics'|'clothing'|'books'",
  })
);
```

:::

All have the same interface regardless of the underlying validation library!

## Branded Types for Primitives

When modeling primitive values like emails or user IDs, use branded types to enforce validation at the type level:

::: code-group

```typescript twoslash [Email]
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

// Create branded type
type Email = InferModelOutput<typeof Email>;
const Email = createModel(z.string().email().brand('Email'));

// Function can now require already validated data
function sendWelcomeEmail(to: Email) {
  // No need to validate - email is guaranteed to be valid
  console.log(`Sending welcome email to ${to}`);
}

// Usage requires validation
const email = Email.from('user@example.com');

sendWelcomeEmail(email);
```

```typescript twoslash [UserId]
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

// Create branded type
type UserId = InferModelOutput<typeof UserId>;
const UserId = createModel(z.string().uuid().brand('UserId'));

// Function can now require already validated data
function getUser(id: UserId) {
  // No need to validate - ID is guaranteed to be a valid UUID
  return fetch(`/api/users/${id}`);
}

// Usage requires validation
const userId = UserId.from('123e4567-e89b-12d3-a456-426614174000');

getUser(userId);
```

:::

### Branded Types Across Libraries

::: code-group

```typescript twoslash [Zod]
import { z } from 'zod';

const Email = z.string().email().brand('Email');
const UserId = z.string().uuid().brand('UserId');
```

```typescript twoslash [Valibot]
import * as v from 'valibot';

const Email = v.pipe(v.string(), v.email(), v.brand('Email'));
const UserId = v.pipe(v.string(), v.uuid(), v.brand('UserId'));
```

```typescript twoslash [ArkType]
import { type } from 'arktype';

const Email = type('string.email#Email');
const UserId = type('string.uuid#UserId');
```

:::

## Safe Error Handling

If you prefer Result types over exceptions, use the safe model creators from `@uni-ts/model/safe`. In such case, remember to have `@uni-ts/result` installed in your project.

```typescript twoslash
import { createSafeModel } from '@uni-ts/model/safe';
import { isOk } from '@uni-ts/result';
import { z } from 'zod';

const User = createSafeModel(
  z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().int().min(0),
  })
);

// Safe validation returns Result instead of throwing
const result = User.from({ name: 'John', email: 'invalid', age: 25 });

if (isOk(result)) {
  console.log('User created:', result.data);
} else {
  console.error('Validation failed:', result.error);
}
```

### Safe Model Variants

`@uni-ts/model/safe` provides three variants of safe model creators, so you can choose the one that fits your coding style.

::: code-group

```typescript twoslash [createSafeModel]
const data = { name: 'John', email: 'invalid', age: 25 };
// ---cut---
import { createSafeModel } from '@uni-ts/model/safe';
import { z } from 'zod';

const User = createSafeModel(
  z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().int().min(0),
  })
);

// Only safe methods available
const user1 = User.from(data);
const user2 = User.cast(data);
```

```typescript twoslash [createSafeFirstModel]
const data = { name: 'John', email: 'invalid', age: 25 };
// ---cut---
import { createSafeFirstModel } from '@uni-ts/model/safe';
import { z } from 'zod';

const User = createSafeFirstModel(
  z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().int().min(0),
  })
);

// Safe by default, unsafe methods with prefix
const user1 = User.from(data);
const user2 = User.cast(data);
const user3 = User.unsafeFrom(data);
const user4 = User.unsafeCast(data);
```

```typescript twoslash [createUnsafeFirstModel]
const data = { name: 'John', email: 'invalid', age: 25 };
// ---cut---
import { createUnsafeFirstModel } from '@uni-ts/model/safe';
import { z } from 'zod';

const User = createUnsafeFirstModel(
  z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().int().min(0),
  })
);

// Unsafe by default, safe methods with prefix
const user1 = User.from(data);
const user2 = User.cast(data);
const user3 = User.safeFrom(data);
const user4 = User.safeCast(data);
```

:::

## Extending Models

Models become even more powerful when you correlate them with some business rules. You can use the `.extend()` method to add custom functionality.

::: code-group

```typescript twoslash [Definition]
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

type Product = InferModelOutput<typeof Product>;
const Product = createModel(
  z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    stock: z.number().int().min(0),
  })
).extend({
  isInStock,
  canBeSold,
});

function isInStock(product: Product) {
  return product.stock > 0;
}

function canBeSold(product: Product, quantity: number) {
  return product.stock >= quantity && quantity > 0;
}
```

```typescript twoslash [Usage]
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

type Product = InferModelOutput<typeof Product>;
const Product = createModel(
  z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    stock: z.number().int().min(0),
  })
).extend({
  isInStock,
  canBeSold,
});

function isInStock(product: Product) {
  return product.stock > 0;
}

function canBeSold(product: Product, quantity: number) {
  return product.stock >= quantity && quantity > 0;
}
// ---cut---

const laptop = Product.from({
  name: 'Gaming Laptop',
  price: 1299.99,
  stock: 5,
});

Product.isInStock(laptop); // true
Product.canBeSold(laptop, 3); // true
```

:::

## Working with APIs

Models shine when working with external APIs. Here's a common pattern for usage with data fetching.

::: code-group

```typescript twoslash [user.ts]
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

// Domain model with business logic
export type User = InferModelOutput<typeof User>;
export const User = createModel(
  z.object({
    id: z.string().uuid().brand('UserId'),
    name: z.string().min(1),
    email: z.string().email().brand('Email'),
    createdAt: z.date(),
  })
).extend({ isNew });

function isNew(user: User) {
  const daysSinceCreation =
    (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceCreation <= 7;
}
```

```typescript twoslash [api-user.ts]
// @filename: user.ts
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type User = InferModelOutput<typeof User>;
export const User = createModel(
  z.object({
    id: z.string().uuid().brand('UserId'),
    name: z.string().min(1),
    email: z.string().email().brand('Email'),
    createdAt: z.date(),
  })
).extend({ isNew });

function isNew(user: User) {
  const daysSinceCreation =
    (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceCreation <= 7;
}

// @filename: api-user.ts
// ---cut---
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';
import { User } from './user';

// API response model
export type ApiUser = InferModelOutput<typeof ApiUser>;
export const ApiUser = createModel(
  z.object({
    id: z.string().uuid(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email(),
    created_at: z.number().int().min(0),
  })
).extend({ toUser });

function toUser(apiUser: ApiUser) {
  return User.from({
    id: apiUser.id,
    name: `${apiUser.first_name} ${apiUser.last_name}`,
    email: apiUser.email,
    createdAt: new Date(apiUser.created_at),
  });
}
```

```typescript twoslash [user-service.ts]
// @filename: user.ts
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type User = InferModelOutput<typeof User>;
export const User = createModel(
  z.object({
    id: z.string().uuid().brand('UserId'),
    name: z.string().min(1),
    email: z.string().email().brand('Email'),
    createdAt: z.date(),
  })
).extend({ isNew });

function isNew(user: User) {
  const daysSinceCreation =
    (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceCreation <= 7;
}

// @filename: api-user.ts
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';
import { User } from './user';

export type ApiUser = InferModelOutput<typeof ApiUser>;
export const ApiUser = createModel(
  z.object({
    id: z.string().uuid(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email(),
    created_at: z.number().int().min(0),
  })
).extend({ toUser });

function toUser(apiUser: ApiUser) {
  return User.from({
    id: apiUser.id,
    name: `${apiUser.first_name} ${apiUser.last_name}`,
    email: apiUser.email,
    createdAt: new Date(apiUser.created_at),
  });
}
// @filename: user-service.ts
// ---cut---
import { ApiUser } from './api-user';
import { User } from './user';

export async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const apiData = await response.json();

  // Validate API response
  const apiUser = ApiUser.cast(apiData);

  // Convert to domain model
  return ApiUser.toUser(apiUser);
}

// Example usage
const user = await fetchUser('123e4567-e89b-12d3-a456-426614174000');

if (User.isNew(user)) {
  console.log(`Welcome ${user.name}!`);
}
```

:::
