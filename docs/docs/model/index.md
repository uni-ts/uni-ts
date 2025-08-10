# Introduction

:::info
This is an introduction to **model concept** itself. For package documentation, see the [Getting Started](/docs/model/getting-started) guide.
:::

## What is a Model?

A Model is a code representation of a real-world thing (e.g. User, Product, Recipe) or a conceptual one (e.g. Duration, Currency, Temperature). It's a blueprint that defines:

- **What something IS:** The data it holds and what rules it must follow.
- **What it CAN DO:** The actions that can be performed on it and what rules govern those actions.

Let's see this in action with a simple example.

```typescript twoslash
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

// Type of a valid Product
type Product = InferModelOutput<typeof Product>;

const Product = createModel(
  // Structure: what properties a Product has and what rules they follow
  z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    amount: z.int().positive(),
  })
).extend({
  // Behavior: what operations can be performed on a Product
  canBeSold: (product: Product) => product.amount > 0,
});
```

The `Product` model above contains everything we need to work with products in our application — from validation rules to business logic. If you need to change anything product-related in the future, you only have one place to look.

## Models for Primitives

But what if instead of modeling a complex object like `Product`, we want to model a simple primitive value? Consider this scenario:

```typescript twoslash
function sendWelcomeEmail(to: string) {
  // What if the email is invalid?
  // What if an empty string is passed?
}

// Looks fine
sendWelcomeEmail('test@example.com');

// Oops!
sendWelcomeEmail('example.com');
sendWelcomeEmail('');
```

The problem is that plain primitive types don't capture the meaning or rules of your data. That's where **branded types** come in handy.

### Branded Types

A branded type is a basic TypeScript type (like `string`, `number`, or `object`) with a "brand" attached to give it additional meaning.

:::code-group

```typescript twoslash [Without brand]
type Email = string;

function sendWelcomeEmail(to: Email) {}

const email = String(window.prompt('Enter your email'));

sendWelcomeEmail(email); // Accepts any string
```

```typescript twoslash [With brand]
// @errors: 2345
type Email = string & { __brand: 'email' };

function sendWelcomeEmail(to: Email) {}

const email = String(window.prompt('Enter your email'));

sendWelcomeEmail(email); // Requires a branded type
```

:::

By branding a type, we don't change anything at runtime — our `Email` type is still a `string`. However, TypeScript now treats it as a distinct type, allowing us to connect validation logic to it.

```typescript twoslash
type Email = string & { __brand: 'email' };

function validateEmail(email: string) {
  if (!email.includes('@')) {
    throw new Error('Invalid email');
  }

  // Type casting is required to satisfy the type checker
  return email as Email;
}

function sendWelcomeEmail(to: Email) {}

// Email needs to be validated beforehand
const email = validateEmail(String(window.prompt('Enter your email')));

sendWelcomeEmail(email); // Now type checks pass
```

::: tip 💡 Learn more
If you want to dive deeper into branded types, we highly recommend checking out [this article](https://www.learningtypescript.com/articles/branded-types).
:::

### Branded Types with Models

While you can create branded types manually, it's much easier to use existing libraries. In the example below, you can see how to use Zod's `.brand()` method to create a branded type and incorporate it into a model.

```typescript twoslash
// @errors: 2345
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

// Create model with a branded type using .brand()
const Email = createModel(z.string().email().brand('Email'));

// Get the branded type (hover to see it's not just a string)
type Email = InferModelOutput<typeof Email>;

// Our function accepts only valid emails
function sendWelcomeEmail(to: Email) {}

// We get the email from an external source
const email = String(window.prompt('Enter your email'));

sendWelcomeEmail(email); // Not validated email

if (Email.is(email)) {
  sendWelcomeEmail(email); // Validated email
}

sendWelcomeEmail(Email.from(email)); // Another validated email
```

As mentioned before, with models our `Email` is still a string at runtime. We simply made TypeScript's type system treat it differently.

::: tip You can brand anything
In the example above we used a primitive `string` type to showcase branding. However, you can also brand other primitive types, arrays, and objects.
:::

## Why Use Models?

Let's explore how models make your code better through practical examples.

### Single Source of Truth

Validation logic is often written on the spot, directly in functions that need to perform some operation on the data. This approach can easily lead to duplicating the same validation rules in multiple places, or even worse, applying different validation rules to the same data.

::: code-group

```typescript twoslash [create-contact.ts]
// @filename: contact.ts
export type Contact = {
  id: string;
  name: string;
  email: string;
};
// @filename: create-contact.ts
// ---cut---
import { Contact } from './contact';

function createContact(data: Contact) {
  // Validation rules are separated from the Contact type
  if (!data.email.includes('@')) {
    throw new Error('Invalid email');
  }

  if (data.name.length < 3) {
    throw new Error('Name too short');
  }
  // ...
}
```

```typescript twoslash [update-contact.ts]
// @filename: contact.ts
export type Contact = {
  id: string;
  name: string;
  email: string;
};
// @filename: update-contact.ts
// ---cut---
import { Contact } from './contact';

function updateContact(data: Contact) {
  // Duplicated email validation logic
  if (!data.email.includes('@')) {
    throw new Error('Invalid email');
  }

  // Oops! In `createContact` we require at least 3 characters
  if (data.name.length < 1) {
    throw new Error('Name too short');
  }
  // ...
}
```

```typescript twoslash [contact.ts]
export type Contact = {
  id: string;
  name: string;
  email: string;
};
```

:::

With models, we get a single place where all data validation rules live. This way, we ensure that all other parts of our codebase share the same validation logic.

:::code-group

```typescript twoslash [create-contact.ts]
// @filename: contact.ts
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type Contact = InferModelOutput<typeof Contact>;
export const Contact = createModel(
  z.object({
    id: z.uuid(),
    email: z.string().email(),
    name: z.string().min(3),
  })
);

// @filename: create-contact.ts
// ---cut---
import { Contact } from './contact';

function createContact(data: Contact) {
  const contact = Contact.from(data); // One-line validation
  // ...
}
```

```typescript twoslash [update-contact.ts]
// @filename: contact.ts
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type Contact = InferModelOutput<typeof Contact>;
export const Contact = createModel(
  z.object({
    id: z.uuid(),
    email: z.string().email(),
    name: z.string().min(3),
  })
);

// @filename: update-contact.ts
// ---cut---
import { Contact } from './contact';

function updateContact(data: Contact) {
  const contact = Contact.from(data); // Same validation rules
  // ...
}
```

```typescript twoslash [contact.ts]
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type Contact = InferModelOutput<typeof Contact>;
export const Contact = createModel(
  z.object({
    id: z.uuid(),
    email: z.string().email(),
    name: z.string().min(3),
  })
);
```

:::

### Separation of Concerns

You may often find yourself writing validation logic in places where it doesn't belong. It's also common to repeat the same validation logic in multiple places because you can't be sure whether the data has already been validated or not.

```typescript twoslash [Without models]
function isEmail(email: string) {
  return email.includes('@');
}
// ---cut---

// Function is responsible for both
// email validation and sending the email
function sendWelcomeEmail(to: string) {
  if (!isEmail(to)) {
    throw new Error('Invalid email');
  }
  // ...
}

function registerUser(data: { email: string; password: string }) {
  if (!isEmail(data.email)) {
    throw new Error('Invalid email');
  }

  // ...

  // Email validation will happen again
  sendWelcomeEmail(data.email);
}
```

Models with branded types help you separate data validation from business logic, making your code more maintainable.

```typescript twoslash [With models]
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

type Email = InferModelOutput<typeof Email>;
const Email = createModel(z.string().email().brand('Email'));

function sendWelcomeEmail(to: Email) {
  // only business logic here
}

function registerUser(data: { email: string; password: string }) {
  const email = Email.from(data.email);

  // ...

  // We know email is already validated from its type
  sendWelcomeEmail(email);
}
```

### Centralized Business Logic

Another typical maintenance burden is having business rules scattered across the entire codebase. When multiple parts of the project need to know about the same business rule, it's easy to forget to update it in one place and introduce bugs. It also makes it hard to understand all the rules your application has.

::: code-group

```typescript twoslash [withdraw-money.ts]
// @filename: account.ts
export type Account = {
  id: string;
  balance: number;
  isActive: boolean;
};

// @filename: withdraw-money.ts
// ---cut---
import type { Account } from './account';

export function withdrawMoney(account: Account, amount: number) {
  if (!account.isActive || account.balance < amount) {
    throw new Error('Cannot make a withdrawal');
  }

  // ...
}
```

```typescript twoslash [deposit-money.ts]
// @filename: account.ts
export type Account = {
  id: string;
  balance: number;
  isActive: boolean;
};

// @filename: deposit-money.ts
// ---cut---
import type { Account } from './account';

export function depositMoney(account: Account, amount: number) {
  if (!account.isActive) {
    throw new Error('Cannot make a deposit');
  }

  // ...
}
```

```typescript twoslash [transfer-money.ts]
// @filename: account.ts
// ---cut---
export type Account = {
  id: string;
  balance: number;
  isActive: boolean;
};

// @filename: transfer-money.ts
// ---cut---
import type { Account } from './account';

export function transferMoney(from: Account, to: Account, amount: number) {
  if (!from.isActive || from.balance < amount || !to.isActive) {
    throw new Error('Cannot make a transfer');
  }

  // ...
}
```

```typescript twoslash [account.ts]
export type Account = {
  id: string;
  balance: number;
  isActive: boolean;
};
```

:::

With models, we can attach business logic directly to the data it operates on, keeping everything organized in one place.

::: code-group

```typescript twoslash [withdraw-money.ts]
// @filename: account.ts
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type Account = InferModelOutput<typeof Account>;
export const Account = createModel(
  z.object({
    id: z.uuid(),
    balance: z.number().min(0),
    isActive: z.boolean(),
  })
).extend({
  canReceiveMoney,
  canSpendMoney,
  canTransferMoney,
});

function canReceiveMoney(account: Account) {
  return account.isActive;
}

function canSpendMoney(account: Account, amount: number) {
  return account.isActive && account.balance >= amount;
}

function canTransferMoney(from: Account, to: Account, amount: number) {
  return canSpendMoney(from, amount) && canReceiveMoney(to);
}

// @filename: withdraw-money.ts
// ---cut---
import { Account } from './account';

export function withdrawMoney(account: Account, amount: number) {
  if (!Account.canSpendMoney(account, amount)) {
    throw new Error('Cannot make a withdrawal');
  }

  // ...
}
```

```typescript twoslash [deposit-money.ts]
// @filename: account.ts
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type Account = InferModelOutput<typeof Account>;
export const Account = createModel(
  z.object({
    id: z.uuid(),
    balance: z.number().min(0),
    isActive: z.boolean(),
  })
).extend({
  canReceiveMoney,
  canSpendMoney,
  canTransferMoney,
});

function canReceiveMoney(account: Account) {
  return account.isActive;
}

function canSpendMoney(account: Account, amount: number) {
  return account.isActive && account.balance >= amount;
}

function canTransferMoney(from: Account, to: Account, amount: number) {
  return canSpendMoney(from, amount) && canReceiveMoney(to);
}

// @filename: deposit-money.ts
// ---cut---
import { Account } from './account';

export function depositMoney(account: Account, amount: number) {
  if (!Account.canReceiveMoney(account)) {
    throw new Error('Cannot make a deposit');
  }

  // ...
}
```

```typescript twoslash [transfer-money.ts]
// @filename: account.ts
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type Account = InferModelOutput<typeof Account>;
export const Account = createModel(
  z.object({
    id: z.uuid(),
    balance: z.number().min(0),
    isActive: z.boolean(),
  })
).extend({
  canReceiveMoney,
  canSpendMoney,
  canTransferMoney,
});

function canReceiveMoney(account: Account) {
  return account.isActive;
}

function canSpendMoney(account: Account, amount: number) {
  return account.isActive && account.balance >= amount;
}

function canTransferMoney(from: Account, to: Account, amount: number) {
  return canSpendMoney(from, amount) && canReceiveMoney(to);
}

// @filename: transfer-money.ts
// ---cut---
import { Account } from './account';

export function transferMoney(from: Account, to: Account, amount: number) {
  if (!Account.canTransferMoney(from, to, amount)) {
    throw new Error('Cannot make a transfer');
  }

  // ...
}
```

```typescript twoslash [account.ts]
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type Account = InferModelOutput<typeof Account>;
export const Account = createModel(
  z.object({
    id: z.uuid(),
    balance: z.number().min(0),
    isActive: z.boolean(),
  })
).extend({
  canReceiveMoney,
  canSpendMoney,
  canTransferMoney,
});

function canReceiveMoney(account: Account) {
  return account.isActive;
}

function canSpendMoney(account: Account, amount: number) {
  return account.isActive && account.balance >= amount;
}

function canTransferMoney(from: Account, to: Account, amount: number) {
  return canSpendMoney(from, amount) && canReceiveMoney(to);
}
```

:::

## Do I Need This Library?

While reading this page, you may have noticed that all the practices we've covered don't require you to use `@uni-ts/model`. It's really about utilizing a schema validation library like Zod and combining it with best practices for code organization. And you're absolutely right! So what does this library bring to the table?

- It gives you a unified way of creating models and inferring their types (`createModel`, `InferModelOutput`)
- It equips each model with essential utilities like `schema`, `is`, `from`, and `cast`
- It allows you to use any validation library that supports [Standard Schema](https://github.com/standard-schema/standard-schema) for model validation
- It provides you with a model extension mechanism out of the box

If these benefits seem useful for your project, give this package a try!

## Getting Started

Ready to start using models in your project? Check out the [Getting Started](/docs/model/getting-started) guide to learn how to install and use the `@uni-ts/model` package with your favorite validation library.
