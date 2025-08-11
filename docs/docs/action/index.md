# Introduction

:::info
This is an introduction to the **Action concept** itself. For package documentation, see the [Getting Started](/docs/action/getting-started) guide.
:::

## What is an Action?

An Action is a composable pipeline that combines multiple middleware functions with a final action function. Think of it as a type-safe way to build complex operations by chaining smaller, focused functions together — each handling a specific concern like validation, authentication, logging, or business logic.

<!--@include: ./snippets/index/what-is-action.md-->

Actions provide a structured way to organize complex operations while keeping each step focused, testable, and reusable.

## Why Use Actions?

Actions solve common problems you encounter when building complex applications. Let's explore these challenges and how actions address them.

### Scattered Cross-cutting Concerns

In traditional applications, concerns like validation, authentication, and logging are often scattered throughout your codebase, making them hard to maintain and test.

<!--@include: ./snippets/index/scattered-concerns/index.md-->

### Error Handling Complexity

Complex operations often require different error handling strategies at different steps. This leads to multiple try-catch blocks and the need to define additional variables to get the values out of them.

<!--@include: ./snippets/index/error-handling/index.md-->

### Testing Difficulties

Testing complex operations with multiple concerns mixed together is challenging. You often need to mock multiple dependencies and set up complex scenarios. With actions, each middleware function can be tested independently, and you can easily test different combinations.

<!--@include: ./snippets/index/testing-example.md-->

## Getting Started

Ready to start using Actions in your project? Check out the [Getting Started](/docs/action/getting-started) guide to learn how to install and use the `@uni-ts/action` package with practical examples.
