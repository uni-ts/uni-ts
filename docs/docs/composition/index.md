# Introduction

:::info
This is an introduction to **function composition concept** itself. For package documentation, see the [Getting Started](/docs/composition/getting-started) guide.
:::

## What is Function Composition?

Function composition is a programming concept that allows you to combine multiple simple functions to create more complex operations. Think of it like an assembly line where data flows through a series of transformations, with each function performing a specific operation before passing the result to the next function.

Instead of writing complex, nested function calls that are hard to read and maintain, composition lets you create clear, step-by-step pipelines that transform data from input to output.

<!--@include: ./snippets/index/what-is-composition.md-->

## Why Use Function Composition?

Function composition transforms how you structure and think about your code, by encouraging you to break things down into smaller, reusable functions. Let's explore why this matters through practical examples.

### Readability: From Nested Chaos to Clear Pipelines

Traditional nested function calls read from inside-out (right to left), making it difficult to follow the data transformation flow.

<!--@include: ./snippets/index/readability/without.md-->

The composed version reads like a step-by-step recipe.

<!--@include: ./snippets/index/readability/with.md-->

### Reusability: Build Once, Use Everywhere

Composition encourages you to create small functions that can be easily reused in multiple pipelines.

<!--@include: ./snippets/index/reusability/index.md-->

### Testability: Small Functions, Big Confidence

By writing small, focused functions, testing becomes a breeze. It's also far less likely you'll forget to test some part of a function.

<!--@include: ./snippets/index/testability/index.md-->

## Getting Started

Ready to start using function composition in your project? Check out the [Getting Started](/docs/composition/getting-started) guide to learn how to install and use the `@uni-ts/composition` package.
