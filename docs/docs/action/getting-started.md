# Getting Started

Ready to use Actions in your project? This guide will walk you through installation, basic usage, and common patterns to help you build composable action pipelines quickly.

<!--@include: ../../snippets/installation.md-->

### Install the Package

You can install `@uni-ts/action` using your preferred package manager:

::: code-group

```sh [npm]
$ npm add @uni-ts/action
```

```sh [pnpm]
$ pnpm add @uni-ts/action
```

```sh [yarn]
$ yarn add @uni-ts/action
```

```sh [bun]
$ bun add @uni-ts/action
```

:::

If you want to handle errors using Result types instead of throwing exceptions, you can also install `@uni-ts/result`:

::: code-group

```sh [npm]
$ npm add @uni-ts/action @uni-ts/result
```

```sh [pnpm]
$ pnpm add @uni-ts/action @uni-ts/result
```

```sh [yarn]
$ yarn add @uni-ts/action @uni-ts/result
```

```sh [bun]
$ bun add @uni-ts/action @uni-ts/result
```

:::

## Your First Action

As you saw in the [Introduction](./index.md), an Action is a composable pipeline that combines middleware functions with a final action. Let's see this on a simple example.

<!--@include: ./snippets/getting-started/your-first-action.md-->

## Building Action Pipelines

Actions are built using a fluent API pattern with three key components.

### 1. Action Builder

Start with `createAction()` and optionally specify the input type:

<!--@include: ./snippets/getting-started/action-builder.md-->

### 2. Middleware Chain

Use `.with()` to add middleware functions. Each middleware can:

- **Continue the pipeline** by calling `next()` (empty, or with context data to pass further)
- **Short-circuit the pipeline** by returning a value or throwing an exception

<!--@include: ./snippets/getting-started/middleware-chain.md-->

### 3. Final Action

Use `.do()` to define what happens when all middleware passes. The main difference between `.with()` and `.do()` is that

- `.with()` can return the `next()` function to continue the pipeline, while `.do()` cannot.
- `.with()` continues the pipeline (returns a builder), while `.do()` executes the action (returns a function).

<!--@include: ./snippets/getting-started/final-action.md-->

## Context Sharing

One of the most powerful features of actions is the ability to share typed context between middleware functions and the final action.

### Building Context Step by Step

Each middleware can add data to the context using `next()`:

<!--@include: ./snippets/getting-started/context-sharing.md-->

### Context Overrides

Each new context object is merged with the previous one. You can override the previous context by returning a new object with the same keys.

<!--@include: ./snippets/getting-started/context-overrides.md-->

## Async Operations

Actions work seamlessly with async functions. When any middleware or action returns a Promise, the entire action becomes async:

<!--@include: ./snippets/getting-started/async-operations.md-->

You can mix sync and async middleware freely - the action will automatically become async when needed.

## Error Handling

Actions provide several approaches to handle errors, from simple exceptions to custom error handling strategies.

### Basic Exception Handling

By default, any thrown error stops the pipeline and gets wrapped in a `ThrownActionError`:

<!--@include: ./snippets/getting-started/error-handling/basic-exception.md-->

### Custom Error Handling

You can customize how exceptions are handled by providing an `onThrow` function:

<!--@include: ./snippets/getting-started/error-handling/custom-error.md-->

## Safe Actions with Result Types

For functional error handling without exceptions, you can utilize safe actions that return Result types instead of throwing.

### Installing Result Support

Safe actions require the `@uni-ts/result` package:

```sh
npm add @uni-ts/result
```

### Creating Safe Actions

Safe actions differ from the regular ones mostly by their return type. While regular actions return values and throw exceptions, safe actions return `ok(value)` or `err(error)` values.

<!--@include: ./snippets/getting-started/safe-actions.md-->

### Safe vs Regular Actions

| Feature                | Regular Actions           | Safe Actions                           |
| ---------------------- | ------------------------- | -------------------------------------- |
| **Dependencies**       | None                      | `@uni-ts/result`                       |
| **Import**             | `@uni-ts/action`          | `@uni-ts/action/safe`                  |
| **Creator**            | `createAction()`          | `createSafeAction()`                   |
| **Error Handling**     | Throws exceptions         | Returns `err(error)`                   |
| **Middleware Returns** | Value, `next()`, or throw | `ok(value)`, `err(error)`, or `next()` |
| **Action Returns**     | Value or throw            | `ok(value)` or `err(error)`            |
