# Best Practices

## Domain Models

Each application contains a set of core concepts and rules that makes it distinct from others. A banking app prevents you from withdrawing more than your balance. An e-commerce app won't let you apply more than one discount per order. A social platform might restrict who can see your posts. While these constraints (also called business logic or business rules) often end up scattered across the codebase a good practice is to get them together into so called **domain models**.

A domain model is a specific kind of a [model](/docs/model/index#what-is-a-model) with the following characteristics:

- **Represents a core business concept.**

  Uses the same language that business people use when talking about the system (ubiquitous language). For example `BankAccount` with `canWithdraw` may be a domain model in a banking app while `Serializer` likely won't be. In other words, if you show non-technical people only the domain models they should clearly understand what your system is about.

- **Doesn't depend on anything except other domain models.**

  Domain model is your system in its purest form. It focuses on describing concepts and rules without any knowledge on what database will be used, how the logging works, where the app will run (client or server), etc. Because of that, the only dependencies (imports) you should see in domain models are other domain models (e.g. `TodoList` may depend on `TodoItem`) and pure utility functions (e.g. from libraries like `lodash`).

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
