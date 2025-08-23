# Best Practices

## Domain Models

Each application contains a set of core concepts and rules that make it distinct from others. A banking app prevents you from withdrawing more than your balance. An e-commerce app won't let you apply more than one discount per order. A social platform might restrict who can see your posts. While these constraints (also called business logic or business rules) often end up scattered across the codebase, a good practice is to bring them together into so-called **domain models**.

A domain model is a specific kind of a [model](/docs/model/index#what-is-a-model) with the following characteristics:

- **Represents a core business concept.**

  Uses the same language that business people use when talking about the system (ubiquitous language). For example `BankAccount` with `canWithdraw` may be a domain model in a banking app while `Serializer` likely won't be. In other words, if you show non-technical people only the domain models they should clearly understand what your system is about.

- **Doesn't depend on anything except other domain models.**

  A domain model is your system in its purest form. It focuses on describing concepts and rules without any knowledge of what database will be used, how the logging works, where the app will run (client or server), etc. Because of that, the only dependencies (imports) you should see in domain models are other domain models (e.g. `TodoList` may depend on `TodoItem`) and pure utility functions (e.g. from libraries like `lodash`).

Below you can see some examples of domain (✅) and non-domain (❌) models for an e-commerce app.

<!--@include: ./snippets/best-practices/domain-models/index.md-->

### Why Use Domain Models?

**🎯 Everything in One Place**

Instead of having your business rules scattered across different files, domain models keep them all in one place.

**🗣️ Speaks Business Language**

Domain models use the same words your business team uses. When they ask you "When the order can be cancelled?" your code literally has a `canBeCancelled()` method that answers this question. This makes it much easier for developers and business people to understand each other and spot bugs.

**📖 Self-Documenting Code**

Looking at a domain model immediately tells you what your system does and what rules it follows. New team members can understand the core business logic just by reading the domain models, without diving into complex infrastructure code.

**🧪 Easy to Test**

Since domain models don't depend on anything except other models, you can test your business logic in isolation. This makes tests faster, more reliable, and easier to understand.

**🔄 Reusable Everywhere**

Once you have a domain model, you can use it anywhere in your app, ensuring business logic stays consistent across multiple different contexts.

## Model Composition

In some cases you may wonder if you should merge multiple models into one or move some model property to a standalone model. While there is no one-size-fits-all answer, here are some guidelines to help you make the right decision:

### 1. Check the model methods

As a rule of thumb, all model methods should receive (or return) the model instance. While not using all model's properties by a method is fine, situations where a method uses only one property are a good indicator that the property may benefit from a model of its own.

<!--@include: ./snippets/best-practices/check-model-methods/index.md-->

### 2. Consider domain boundaries

Models should align with a single business domain. If two pieces of data are related to different areas of your system, they should probably be separate models.

<!--@include: ./snippets/best-practices/domain-boundaries/index.md-->

### 3. Look for cohesion patterns

Properties that are always used together or changed together are good candidates for the same model. Properties that are used independently suggest separate models.

<!--@include: ./snippets/best-practices/cohesion-patterns/index.md-->

:::tip 💡 Prefer smaller models
When in doubt, prefer dividing models into smaller ones over keeping them together. It's always easier to merge models again if needed than to untangle a complex model.
:::

## When to Use Branded Types?

Branded types are a powerful pattern allowing you to create distinct types with consistent validation rules and related methods. However, they may be easily overused, causing your code to become bloated with type validations and the same methods repeated across different branded types.

To avoid this, here are some guidelines on when branded types are useful and when they are usually not.

**✅ Type usage requires its validation**

When all utilities related to a type require it to be valid (match certain criteria), make it a branded type.

<!--@include: ./snippets/best-practices/branded-types/validation-required.md-->

**❌ Type can be used the same way - branded or not**

When type usage doesn't require any validation beyond TypeScript type matching, there is probably no need to brand it.

<!--@include: ./snippets/best-practices/branded-types/validation-non-required.md-->

**✅ Type distinction provides additional value**

When distinction between similar types benefits your code's type safety, brand each of them.

<!--@include: ./snippets/best-practices/branded-types/distinction-useful.md-->

**❌ Type distinction is purely cosmetic**

When branding serves only a cosmetic purpose, it likely can be avoided.

<!--@include: ./snippets/best-practices/branded-types/distinction-useless.md-->

**✅ Object properties are correlated**

When in order for an object to be valid, its properties must maintain some correlations with each other, it's a sign you should brand this object.

<!--@include: ./snippets/best-practices/branded-types/properties-correlated.md-->

**❌ Object properties are independent**

When each property validation depends only on its own value, the object can stay unbranded.

<!--@include: ./snippets/best-practices/branded-types/properties-non-correlated.md-->

## Branded Types Composition

As a branded type is just an intersection of the base type and the brand, it can be passed to functions that expect either the full branded type or just the base type.

<!--@include: ./snippets/best-practices/branded-types-composition/single.md-->

However, there is nothing stopping us from adding more intersections (brands) to a type in order to further constrain it for specific use cases while making it compatible with the existing ones.

<!--@include: ./snippets/best-practices/branded-types-composition/multiple.md-->

While composing branded types, keep in mind rules from the [previous section](#when-to-use-branded-types) to ensure they actually make your project more maintainable instead of just adding additional complexity.

:::tip 💡 Validation + Domain
The common use case for composing branded types is when the first branded type is validation-related and the following ones are domain-related. A great example is the one above where we use `Email` to validate if the string is a valid email address and then use `AuthEmail` to further constrain it for authentication use cases.
:::
