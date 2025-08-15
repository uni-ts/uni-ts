# Best Practices

## Expected vs. Unexpected Errors

When you're building applications, not all errors are created equal.

### Expected Errors

Expected errors are the ones you anticipate during normal operation of your application. Think of them as part of your business logic — they're scenarios you've planned for and need to handle gracefully. These errors are perfect candidates for Result types because they represent valid outcomes that your users or calling code should know how to handle.

Common examples include:

- User input validation failures
- Business rule violations (like trying to withdraw more money than available)
- Resource not found scenarios
- Authentication and authorization failures

### Unexpected Errors

Unexpected errors are the ones that shouldn't happen during normal operation — they usually indicate bugs, system failures, or truly exceptional circumstances. These are better handled with traditional exception throwing because they represent scenarios where your application can't continue normally.

Examples include:

- Network connectivity issues
- Database connection failures
- Out of memory errors
- Programming bugs

### A Practical Example

Let's look at a simple e-commerce scenario to see this in action:

<!--@include: ./snippets/best-practices/expected-vs-unexpected.md-->

In this example:

- **Expected errors** (product not found, insufficient stock) are wrapped in Result types because they're part of normal business logic that the calling code should handle.
- **Unexpected errors** (database failures) are allowed to throw because they indicate system problems that require different handling (logging, alerting, etc.).

This approach gives you the best of both worlds: explicit, type-safe handling of predictable failures, while still allowing truly exceptional circumstances to bubble up through your error handling infrastructure.

## Approaches to Create Errors

When working with Result types, you have several options for representing your error values. Each approach has its own trade-offs in terms of simplicity, type safety, and extensibility. Let's explore three common patterns:

### 1. String-Based Errors

The simplest approach uses string literals to identify different error types. This is great for quick prototypes and simple applications where you don't need much error context.

<!--@include: ./snippets/best-practices/string-based.md-->

**Pros:**

- ✅ Simple and lightweight
- ✅ Easy to understand and use
- ✅ Great TypeScript autocompletion

**Cons:**

- ❌ No additional context or metadata
- ❌ Can become unwieldy with many error types
- ❌ No extensibility

### 2. Plain Object Errors

Plain objects strike a balance between simplicity and expressiveness. You can include additional data while keeping the structure flat and easy to work with.

<!--@include: ./snippets/best-practices/object-based.md-->

**Pros:**

- ✅ Can include rich contextual data
- ✅ Still lightweight and serializable
- ✅ Great for API responses and logging
- ✅ TypeScript discriminated unions work perfectly

**Cons:**

- ❌ No methods or behavior
- ❌ Can't leverage JavaScript's Error infrastructure like stack traces

### 3. Custom Error Classes

For more complex applications, custom error classes extending the native Error provide the most flexibility and integrate well with existing JavaScript error handling patterns.

<!--@include: ./snippets/best-practices/class-based.md-->

**Pros:**

- ✅ Better code organization (classes like `ValidationError` can be reused)
- ✅ Utilize native JavaScript Error infrastructure (stack traces, instanceof checks)
- ✅ Integrates well with existing error handling patterns
- ✅ Can include methods and computed properties

**Cons:**

- ❌ More verbose to create
- ❌ Requires more standardization upfront
- ❌ Needs to be serialized if you want to send it over the network (e.g. as API response)

:::info 💡 TypeScript Tip
Notice the `readonly type` property in the custom error classes? This discriminant property helps TypeScript distinguish between different error types. Without it, TypeScript might unify similar-looking error classes into a single type, losing important type information.
:::

### Which Approach to Choose?

- **Use strings** for simple use cases with where error context can be contained within the string.
- **Use plain objects** when you need rich error data but want to keep things lightweight or plan to send it over the network.
- **Use custom classes** for complex applications where you need the full power of JavaScript's built-in Error system.
