# Getting Started

Ready to use Result types in your project? This guide will walk you through installation, basic usage, and common patterns to get you productive quickly.

<!--@include: ../../snippets/installation.md-->

### Install the Package

You can install `@uni-ts/result` using your preferred package manager:

::: code-group

```sh [npm]
$ npm add @uni-ts/result
```

```sh [pnpm]
$ pnpm add @uni-ts/result
```

```sh [yarn]
$ yarn add @uni-ts/result
```

```sh [bun]
$ bun add @uni-ts/result
```

:::

## Your First Result

As you saw in the [Introduction](./index.md), a Result is an object representing either success or error.

<!--@include: ./snippets/getting-started/your-first-result.md-->

Since we don't want to repeat ourselves when creating these objects manually, we can use the `ok` and `err` helper functions:

<!--@include: ./snippets/getting-started/ok-err-helpers.md-->

::: info ⚡ TypeScript Magic
The `ok` and `err` functions automatically infer types and makes them readonly, making your code cleaner and more maintainable.
:::

## From Throwing to Returning

Transforming your existing functions to be safe (returning Result instead of throwing) is straightforward. Just replace `throw` statements with `err()` and `return` statements with `ok()`.

<!--@include: ./snippets/getting-started/from-throwing-to-returning/index.md-->

### Working with External Functions

If a throwable function comes from a third-party library or is built-in, you can use `fromThrowable` to make it safe.

<!--@include: ./snippets/getting-started/from-throwable.md-->

For one-off operations where you don't need reusable safe functions, use the `tryCatch` utility.

<!--@include: ./snippets/getting-started/try-catch.md-->

Now that you can create Results, let's see how to work with them.

## Getting Values Out

There are several ways to extract values from Results, each suited for different scenarios.

### Basic Pattern Matching

The most straightforward approach is checking what's inside the Result using `isOk` or `isErr`.

<!--@include: ./snippets/getting-started/basic-pattern-matching/index.md-->

### Destructuring with Tuples

You can extract both values using `toTuple`. It's helpful when you want to utilize each of them individually.

<!--@include: ./snippets/getting-started/to-tuple.md-->

### Unwrapping with Defaults

When you want immediate access to data and have sensible fallbacks, use the `unwrapOr` family of functions.

<!--@include: ./snippets/getting-started/unwrapping-with-defaults/index.md-->

### Advanced Pattern Matching

For complex scenarios where you need different behaviors for success and error cases, use the `match` function.

<!--@include: ./snippets/getting-started/match.md-->

## Moving Back to Throwing

Sometimes you need to integrate with third-party libraries or legacy code that expects exceptions. You have two options for converting Results back to throwing functions.

### Making Safe Functions Throwable

Use `toThrowable` to convert a Result-returning function into one that throws.

<!--@include: ./snippets/getting-started/to-throwable.md-->

### Throwing from Existing Results

Use `unwrapOrThrow` when you already have a Result and need to throw if it's an error.

<!--@include: ./snippets/getting-started/unwrap-or-throw.md-->

::: warning ⚠️ Use with Caution
Converting Results back to exceptions defeats the purpose of explicit error handling. Only do this when integrating with libraries that require it.
:::

## Async Operations

All utilities in this library work seamlessly with async functions. When you pass anything async to a function, the result will become async as well.

<!--@include: ./snippets/getting-started/async-operations.md-->

## Combining Safe Functions

The real power of Result types shines when you need to chain multiple operations that can fail. Instead of nested try-catch blocks, you get clean, type-safe composition with explicit error handling.

There are three approaches to combine safe functions. Choose the one that feels most comfortable.

### Simple Approach

This approach uses early returns to handle errors, keeping the main logic focused on the success path. It may seem verbose, but it's very clear about what's happening at each step. We recommend starting with this approach if Result types are something new to you or your team.

<!--@include: ./snippets/getting-started/composition/simple.md-->

### Functional Composition

You can also use a more functional style by composing functions together. This approach helps you focus on only one path (success or error) at a time, handling the second one automatically.

::: info 📦 Additional package required
To use this approach, you need to install `@uni-ts/composition` or some other library that provides function composition utilities.
:::

<!--@include: ./snippets/getting-started/composition/functional.md-->

### Result Chaining

If you prefer method chaining, you can use the result builder pattern. It provides a fluent API similar to Promise chains but with explicit error handling. It's similar to the functional approach, but operates on chainable objects.

<!--@include: ./snippets/getting-started/composition/chaining.md-->
