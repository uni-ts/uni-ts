# Getting Started

Ready to use Models in your project? This guide will walk you through installation, basic usage, and common patterns to get you productive quickly.

<!--@include: ../../snippets/installation.md-->

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

<!--@include: ./snippets/getting-started/your-first-model.md-->

## Validation Methods

Models provide multiple ways to validate data, each suited for different scenarios:

### Type Guards with `is()`

Use `is()` to safely check unknown data and narrow its type:

<!--@include: ./snippets/getting-started/methods/is.md-->

### Validation with `from()`

When you have data that should match your model's input type, use `from()`:

<!--@include: ./snippets/getting-started/methods/from.md-->

### Validation with `cast()`

When working with completely unknown data (like API responses), use `cast()`:

<!--@include: ./snippets/getting-started/methods/cast.md-->

> [!NOTE] 💡 Pro Tip
> Use `from()` when you're confident about the data structure, and `cast()` when working with external or unknown data sources.

## Working with Different Libraries

Models work with any validation library that supports the [Standard Schema interface](https://github.com/standard-schema/standard-schema). Here are examples with some popular libraries:

<!--@include: ./snippets/getting-started/libraries/index.md-->

All have the same interface regardless of the underlying validation library!

## Branded Types for Primitives

When modeling primitive values like emails or user IDs, use branded types to enforce validation at the type level:

<!--@include: ./snippets/getting-started/branded-types/index.md-->

### Branded Types Across Libraries

<!--@include: ./snippets/getting-started/branded-types-across-libraries/index.md-->

## Safe Error Handling

If you prefer Result types over exceptions, use the safe model creators from `@uni-ts/model/safe`. In such case, remember to have `@uni-ts/result` installed in your project.

<!--@include: ./snippets/getting-started/safe-error-handling.md-->

### Safe Model Variants

`@uni-ts/model/safe` provides three variants of safe model creators, so you can choose the one that fits your coding style.

<!--@include: ./snippets/getting-started/safe-model-variants/index.md-->

## Extending Models

Models become even more powerful when you correlate them with some business rules. You can use the `.extend()` method to add custom functionality.

<!--@include: ./snippets/getting-started/extending-models/index.md-->

## Working with APIs

Models shine when working with external APIs. Here's a common pattern for usage with data fetching.

<!--@include: ./snippets/getting-started/working-with-api/index.md-->
