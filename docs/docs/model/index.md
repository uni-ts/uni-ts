# Introduction

:::info
This is an introduction to **model concept** itself. For package documentation, see the [Getting Started](/docs/model/getting-started) guide.
:::

## What is a Model?

A Model is a code representation of a real-world thing (e.g. User, Product, Recipe) or a conceptual one (e.g. Duration, Currency, Temperature). It's a blueprint that defines:

- **What something IS:** The data it holds and what rules it must follow.
- **What it CAN DO:** The actions that can be performed on it and what rules govern those actions.

Let's see this in action with a simple example.

<!--@include: ./snippets/index/what-is-a-model.md-->

The `Product` model above contains everything we need to work with products in our application — from validation rules to business logic. If you need to change anything product-related in the future, you only have one place to look.

## Models for Primitives

But what if instead of modeling a complex object like `Product`, we want to model a simple primitive value? Consider this scenario:

<!--@include: ./snippets/index/models-for-primitives.md-->

The problem is that plain primitive types don't capture the meaning or rules of your data. That's where **branded types** come in handy.

### Branded Types

A branded type is a basic TypeScript type (like `string`, `number`, or `object`) with a "brand" attached to give it additional meaning.

<!--@include: ./snippets/index/branded-vs-non-branded/index.md-->

By branding a type, we don't change anything at runtime — our `Email` type is still a `string`. However, TypeScript now treats it as a distinct type, allowing us to connect validation logic to it.

<!--@include: ./snippets/index/branded-type-validation.md-->

::: tip 💡 Learn more
If you want to dive deeper into branded types, we highly recommend checking out [this article](https://www.learningtypescript.com/articles/branded-types).
:::

### Branded Types with Models

While you can create branded types manually, it's much easier to use existing libraries. In the example below, you can see how to use Zod's `.brand()` method to create a branded type and incorporate it into a model.

<!--@include: ./snippets/index/branded-type-with-model.md-->

As mentioned before, with models our `Email` is still a string at runtime. We simply made TypeScript's type system treat it differently.

::: tip You can brand anything
In the example above we used a primitive `string` type to showcase branding. However, you can also brand other primitive types, arrays, and objects.
:::

## Why Use Models?

Let's explore how models make your code better through practical examples.

### Single Source of Truth

Validation logic is often written on the spot, directly in functions that need to perform some operation on the data. This approach can easily lead to duplicating the same validation rules in multiple places, or even worse, applying different validation rules to the same data.

<!--@include: ./snippets/index/single-source-of-truth/without/index.md-->

With models, we get a single place where all data validation rules live. This way, we ensure that all other parts of our codebase share the same validation logic.

<!--@include: ./snippets/index/single-source-of-truth/with/index.md-->

### Separation of Concerns

You may often find yourself writing validation logic in places where it doesn't belong. It's also common to repeat the same validation logic in multiple places because you can't be sure whether the data has already been validated or not.

<!--@include: ./snippets/index/separation-of-concerns/without/index.md-->

Models with branded types help you separate data validation from business logic, making your code more maintainable.

<!--@include: ./snippets/index/separation-of-concerns/with/index.md-->

### Centralized Business Logic

Another typical maintenance burden is having business rules scattered across the entire codebase. When multiple parts of the project need to know about the same business rule, it's easy to forget to update it in one place and introduce bugs. It also makes it hard to understand all the rules your application has.

<!--@include: ./snippets/index/centralized-logic/without/index.md-->

With models, we can attach business logic directly to the data it operates on, keeping everything organized in one place.

<!--@include: ./snippets/index/centralized-logic/with/index.md-->

## Do I Need This Library?

While reading this page, you may have noticed that all the practices we've covered don't require you to use `@uni-ts/model`. It's really about utilizing a schema validation library like Zod and combining it with best practices for code organization. And you're absolutely right! So what does this library bring to the table?

- It gives you a unified way of creating models and inferring their types (`createModel`, `InferModelOutput`)
- It equips each model with essential utilities like `schema`, `is`, `from`, and `cast`
- It allows you to use any validation library that supports [Standard Schema](https://github.com/standard-schema/standard-schema) for model validation
- It provides you with a model extension mechanism out of the box

If these benefits seem useful for your project, give this package a try!

## Getting Started

Ready to start using models in your project? Check out the [Getting Started](/docs/model/getting-started) guide to learn how to install and use the `@uni-ts/model` package with your favorite validation library.
