# Introduction

:::info
This is an introduction to the **Result type concept** itself. For package documentation, see the [Getting Started](/docs/result/getting-started) guide.
:::

## What is a Result Type?

A Result type is a powerful concept from functional programming that represents the outcome of an operation that can either succeed or fail. Think of it as a type-safe container that holds either a successful value or an error — never both, and never neither.

<!--@include: ./snippets/index/result-type-definition.md-->

Instead of throwing exceptions or returning `null`/`undefined` for errors, Result types make success and failure explicit parts of your type system, forcing you to handle both cases.

## Why Use Result Types?

The Result type embraces the "errors as values" philosophy, treating errors as data rather than exceptional control flow. Let's explore this concept through a simple division function to see how Result types improve error handling.

### Errors Visible in Type Signatures

**Traditional approach:**

Traditional functions often hide potential errors in their type signatures. When you see a function like `divide(a: number, b: number): number`, TypeScript tells you it returns a number, but it doesn't tell you that it might throw an exception.

<!--@include: ./snippets/index/errors-in-type-signatures/unsafe.md-->

**Result type approach:**

With Result types, potential errors become part of the function's return type signature, making failures explicit and discoverable.

<!--@include: ./snippets/index/errors-in-type-signatures/safe.md-->

### Predictable Control Flow

Now let's see what happens when we use these functions in a larger calculation.

**Traditional approach:**

With traditional exceptions, your program flow can be interrupted at any point, making it hard to reason about what will actually execute.

<!--@include: ./snippets/index/predictable-control-flow/unsafe.md-->

**Result type approach:**

Result types give you predictable, linear control flow where errors are handled explicitly at each step.

<!--@include: ./snippets/index/predictable-control-flow/safe.md-->

### Required Error Handling

Returning `x` and `y` doesn't actually calculate anything. Let's return a sum of those numbers.

**Traditional approach:**

In the traditional approach, you don't see the errors until runtime, so you may forget to handle them.

<!--@include: ./snippets/index/required-error-handling/unsafe.md-->

**Result type approach:**

With Result types, TypeScript will prevent you from accessing the data until you ensure no error has occurred.

<!--@include: ./snippets/index/required-error-handling/safe/index.md-->

### Explicit Error Information

Last but not least, let's handle possible errors from the `divide` function to see how it will look like in both approaches.

**Traditional approach:**

The traditional approach requires you to dig into implementation details or use `instanceof` checks to ensure you handle only the `divide` function exceptions (you may place more throwable functions in the `try` block in the future).

<!--@include: ./snippets/index/explicit-error-information/unsafe.md-->

**Result type approach:**

With Result types, nothing changes from the previous example. You are already sure you're handling only errors from the `divide` function. If you introduce more functions in the future, they will come with their own Result return types, so TypeScript will tell you if they can fail and how.

<!--@include: ./snippets/index/explicit-error-information/safe.md-->

## Why Choose This Package?

As there are other Result type packages out there, you may wonder, what makes this one different? Here's what we believe sets `@uni-ts/result` apart:

**✨ Just Plain Objects**  
Results are simple JavaScript objects, not complex classes. This means you can easily log them or send them through APIs (e.g. using a server action) without any extra work.

**⚡ Function-Based Approach**  
Instead of chaining methods on result classes, you use simple pure functions. Want to create your own utility? Just write a new function — no classes or inheritance needed.

**🔀 Sync and Async Support**  
All utilities work with both synchronous and asynchronous code. You don't have to learn two different APIs or import separate functions for promise handling.

**🌱 Easy to Adopt**  
Start small! You can use Result types in just a few places to get immediate benefits. No need to use more dependencies or rewrite the entire project to see the difference.

## Getting Started

Ready to start using Result types in your project? Check out the [Getting Started](/docs/result/getting-started) guide to learn how to install and use the `@uni-ts/result` package with practical examples and API documentation.
