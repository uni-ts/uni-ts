# @uni-ts/model

**Type-safe data modeling and validation**

The `@uni-ts/model` package provides a unified interface for creating type-safe data models that work seamlessly with validation libraries following the [Standard Schema interface](https://github.com/standard-schema/standard-schema) like [Zod](https://zod.dev), [Valibot](https://valibot.dev), or [ArkType](https://arktype.dev).

## What's a Model?

A Model is a code representation of a real-world thing (e.g. User, Product, Recipe) or conceptual one (e.g. Duration, Currency, Temperature). It's a blueprint that defines:

- **What something IS:** The data it holds and what rules it must follow.
- **What it CAN DO:** The actions it can perform.

With this package your data is represented using primitive values and plain objects, while all related actions and properties are stored separately.

```typescript
// Data type is a plain object
type User = InferModelType<typeof User>;

// Utilities are stored separately under the same name
const User = createModel(
  z.object({
    name: z.string(),
    age: z.number(),
  })
);

User.schema; // Validation schema that each User model must follow
User.is(data); // Check if data is a valid User
User.from(data); // Create a User from given data
```

## Installation

```bash
npm install @uni-ts/model
# or
yarn add @uni-ts/model
# or
pnpm add @uni-ts/model
```

If you want to handle model validation errors safely:

```bash
npm install @uni-ts/model @uni-ts/result
```

## Basic Usage

### Creating Models

Models work with any validation library that supports the Standard Schema interface:

```typescript
import { createModel } from '@uni-ts/model';
import { z } from 'zod';
import * as v from 'valibot';
import { type } from 'arktype';

// With Zod
const ZodUser = createModel(
  z.object({
    name: z.string(),
    email: z.string().email(),
    age: z.number().int().min(0),
  })
);

// With Valibot
const ValibotUser = createModel(
  v.object({
    name: v.string(),
    email: v.pipe(v.string(), v.email()),
    age: v.pipe(v.number(), v.int(), v.min(0)),
  })
);

// With ArkType
const ArkTypeUser = createModel(
  type({
    name: 'string',
    email: 'string.email',
    age: 'number.int>=0',
  })
);

// All have the same interface!
```

### Type Guards

Use the `is()` method to safely check and narrow types:

```typescript
function greetUser(data: unknown) {
  if (User.is(data)) {
    // TypeScript knows data is User type
    console.log(`Hello ${data.name}!`);
  }

  throw new Error('Invalid user data');
}
```

### Validation Methods

```typescript
// from() - validates model input type (receives object with all user properties)
const user1 = User.from({ name: 'John', email: 'john@example.com', age: 25 });

// cast() - validates unknown data (can receive anything)
const user2 = User.cast(someUnknownData);

// Both return the validated and typed data or throw an error
console.log(user1.name); // string
console.log(user2.email); // string
```

### Type Inference

```typescript
import type { InferModelType } from '@uni-ts/model';

type User = InferModelType<typeof User>;
// { name: string; email: string; age: number }

// Use in function signatures
function saveUser(user: User): Promise<void> {
  // user is fully typed
}
```

## Safe Error Handling

For applications that prefer Result types over exceptions:

```typescript
import { createSafeModel } from '@uni-ts/model/safe';
import { isOk, isErr } from '@uni-ts/result';

const User = createSafeModel(
  z.object({
    name: z.string(),
    email: z.string().email(),
  })
);

const userResult = User.from({ name: 'John', email: 'invalid' });

if (isOk(userResult)) {
  console.log('User:', userResult.data); // User type
} else {
  console.error('Validation failed:', userResult.error); // Validation issues
}
```

### Different Safe Variants

```typescript
import {
  createSafeModel, // Only safe methods
  createSafeFirstModel, // Safe by default, unsafe methods available
  createUnsafeFirstModel, // Unsafe by default, safe methods available
} from '@uni-ts/model/safe';

// Only safe methods
const SafeUser = createSafeModel(userSchema);
SafeUser.from(data); // Returns Result<User, Issues[]>
SafeUser.cast(data); // Returns Result<User, Issues[]>

// Safe first (with unsafe alternatives)
const SafeFirstUser = createSafeFirstModel(userSchema);
SafeFirstUser.from(data); // Returns Result<User, Issues[]>
SafeFirstUser.safeCast(data); // Returns Result<User, Issues[]>
SafeFirstUser.unsafeFrom(data); // Throws on error
SafeFirstUser.unsafeCast(data); // Throws on error

// Unsafe first (with safe alternatives)
const UnsafeFirstUser = createUnsafeFirstModel(userSchema);
UnsafeFirstUser.from(data); // Throws on error
UnsafeFirstUser.cast(data); // Throws on error
UnsafeFirstUser.safeFrom(data); // Returns Result<User, Issues[]>
UnsafeFirstUser.safeCast(data); // Returns Result<User, Issues[]>
```

## Extending Models

Models are extensible, allowing you to add custom functionality.

```typescript
const ExtendedUser = User.extend((model) => ({
  // Add custom methods
  greet() {
    return (user: User) => `Hello, ${user.name}!`;
  },

  // Override existing methods
  cast: (data: unknown) => {
    console.log('Validating user...');
    return model.cast(data); // Use original validation
  },
}));

const user = ExtendedUser.from({ name: 'John', email: 'john@example.com', age: 25 });
console.log(ExtendedUser.greet()(user)); // "Hello, John!"
```

## Models for Primitive Types

When creating models for primitive types we recommend using the branded types functionality of the validation library you are using. This way you can move the responsibility of validating the data out of the functions that use it.

⛔️ **Wrong**

```typescript
type Email = InferModelType<typeof Email>; // string
const Email = createModel(z.string().email());

// sendEmail is responsible for checking if the received email is valid
function sendEmail(email: Email) {
  if (Email.is(email)) {
    // ...
  }
}

// TypeScript will allow passing any string here
sendEmail('invalid');
```

✅ **Right**

```typescript
type Email = InferModelType<typeof Email>; // string & z.$brand<'Email'>
const Email = createModel(z.string().email().brand('Email'));

// sendEmail can focus on the business logic
function sendEmail(email: Email) {
  // ...
}

// TypeScript will show an error here
sendEmail('invalid');

// Email needs to be validated before passing it to sendEmail
sendEmail(Email.from('valid@example.com'));
```

**Branded types in different validation libraries**

```typescript
// Zod
const Email = z.string().email().brand('Email');

// Valibot
const Email = v.pipe(v.string(), v.email(), v.brand('Email'));

// ArkType
const Email = type('string.email#Email');
```
