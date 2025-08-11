# Getting Started

This guide will walk you through installation, basic usage, and advanced patterns to help you build readable, maintainable data transformation pipelines.

<!--@include: ../../snippets/installation.md-->

### Install the Package

You can install `@uni-ts/composition` using your preferred package manager:

::: code-group

```sh [npm]
$ npm add @uni-ts/composition
```

```sh [pnpm]
$ pnpm add @uni-ts/composition
```

```sh [yarn]
$ yarn add @uni-ts/composition
```

```sh [bun]
$ bun add @uni-ts/composition
```

:::

## Your First Composition

As you saw in the [Introduction](./index.md), function composition is about connecting simple functions to create complex transformations. Let's start with a basic example:

<!--@include: ./snippets/getting-started/your-first-composition.md-->

Both approaches produce the same result, but serve different purposes:

- **`flow`** creates a reusable function you can call multiple times
- **`pipe`** immediately transforms a specific value

> [!NOTE] 💡 Pro Tip
> Use `flow` when you need to apply the same transformation to multiple values, and `pipe` when you have a single value to transform.

## Core Functions

### `flow` - Build Reusable Pipelines

The `flow` function creates a new function by composing multiple functions in sequence. The output of each function becomes the input of the next.

<!--@include: ./snippets/getting-started/flow-example.md-->

### `pipe` - Immediate Transformation

The `pipe` function applies a series of transformations to a value immediately and returns the final result.

<!--@include: ./snippets/getting-started/pipe-example.md-->

## Async Operations

One of the most powerful features of `@uni-ts/composition` is seamless async support. When any function in the pipeline returns a Promise, the entire composition becomes asynchronous.

<!--@include: ./snippets/getting-started/async-operations.md-->

> [!TIP] ⚡ TypeScript Magic
> Notice how TypeScript automatically infers that `processData` returns `Promise<string>` because one function in the pipeline is async, even though the last two functions are synchronous.

## Builder Style API

For complex pipelines or when you prefer method chaining, use the builder style API. As it doesn't require function overloads under the hood, it's more performant at the type level and has no limit on the number of functions you can chain together.

### `flow`

<!--@include: ./snippets/getting-started/builder-style/flow-builder.md-->

### `pipe`

<!--@include: ./snippets/getting-started/builder-style/pipe-builder.md-->
