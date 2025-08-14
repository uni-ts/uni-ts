import { ModelValidationError } from './error.js';
import { createExtendableModel, getSyncValidationResult } from './helpers.js';
import type { StandardSchemaV1 } from './standard-schema.js';

/**
 * Infers the output type of a model created with `createModel`.
 *
 * @template M - Type of the model object containing a schema property
 *
 * @example
 * ```typescript
 * import { createModel, InferModelOutput } from '@uni-ts/model';
 * import { z } from 'zod';
 *
 * const User = createModel(z.object({
 *   name: z.string().min(1),
 *   email: z.string().email(),
 * }));
 *
 * // Infer the type from the model
 * type User = InferModelOutput<typeof User>; // { name: string; email: string }
 *
 * function processUser(user: User) {
 *   // user is guaranteed to have name and email properties
 *   console.log(user.name, user.email);
 * }
 * ```
 */
export type InferModelOutput<M extends { schema: StandardSchemaV1 }> = StandardSchemaV1.InferOutput<M['schema']>;

/**
 * Infers the input type of a model created with `createModel`.
 *
 * This represents the data structure that the model accepts before validation
 * and transformation. It's also the value accepted by the `from` method.
 *
 * The input type may differ from the output type when the schema
 * includes transformations like trimming, parsing, or coercion.
 *
 * @template M - Type of the model object containing a schema property
 *
 * @example
 * ```typescript
 * import { createModel, InferModelInput, InferModelOutput } from '@uni-ts/model';
 * import { z } from 'zod';
 *
 * const BlogPost = createModel(z.object({
 *   title: z.string().trim(),
 *   status: z.preprocess((value: string) => String(value), z.enum(['draft', 'published'])),
 *   publishedAt: z.date().transform((date) => date.toISOString()),
 * }));
 *
 * // Infer input type - what the model accepts
 * type BlogPostInput = InferModelInput<typeof BlogPost>;
 * // { title: string; status: string; publishedAt: Date }
 *
 * // Infer output type - what the model produces
 * type BlogPost = InferModelOutput<typeof BlogPost>;
 * // { title: string; status: 'draft' | 'published'; publishedAt: string }
 *
 * function createBlogPost(input: BlogPostInput): BlogPost {
 *   return BlogPost.from(input); // validates and transforms input to output
 * }
 * ```
 */
export type InferModelInput<M extends { schema: StandardSchemaV1 }> = StandardSchemaV1.InferInput<M['schema']>;

export type Model<S extends StandardSchemaV1> = ReturnType<typeof createModel<S>>;

/**
 * Creates a type-safe data model based on schema from any Standard Schema compatible validation library.
 *
 * @template S - Type of the Standard Schema compatible validation schema
 * @param schema - A validation schema that follows the Standard Schema interface
 * @returns A model object with validation utilities
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 *
 * type User = InferModelOutput<typeof User>; // { name: string; email: string }
 * const User = createModel(z.object({
 *   name: z.string().min(1),
 *   email: z.string().email(),
 * }));
 *
 * const user1  = User.from({ name: 'John', email: 'john@example.com' }); // User
 * const user2 = User.from({ name: '', email: '' }); // throws ModelValidationError
 * ```
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 *
 * type Email = InferModelOutput<typeof Email>; // string & z.$brand<'Email'>
 * const Email = createModel(z.string().email().brand('Email'));
 *
 * function sendEmail(email: Email) {
 *   // TypeScript ensures only validated emails can be passed
 * }
 * ```
 */
export function createModel<S extends StandardSchemaV1>(schema: S) {
  return createExtendableModel({
    /**
     * The underlying validation schema used by the model.
     *
     * @example
     * ```typescript
     * const Todo = createModel(z.object({
     *   name: z.string(),
     *   completed: z.boolean()
     * }));
     *
     * const TodoList = createModel(z.object({
     *   name: z.string(),
     *   todos: z.array(Todo.schema)
     * }));
     * ```
     */
    schema,

    /**
     * Type guard that checks if a value matches the model's schema.
     *
     * @param value - The value to check against the model schema
     * @returns `true` if the value is valid according to the schema, `false` otherwise
     *
     * @example
     * ```typescript
     * const User = createModel(z.object({ name: z.string() }));
     *
     * async function fetchUser(data: unknown) {
     *   const response = await fetch('/api/user').then(res => res.json());
     *
     *   return User.is(response) ? response : null;
     * }
     * ```
     */
    is: (value: unknown): value is StandardSchemaV1.InferOutput<S> => !getSyncValidationResult(schema, value).issues,

    /**
     * Validates and converts data that matches the model's input type to the model's output type.
     *
     * @param value - Data matching the model's input type
     * @returns The validated and potentially transformed data
     * @throws {ModelValidationError} When the input data doesn't match the schema
     *
     * @example
     * ```typescript
     * const User = createModel(z.object({
     *   name: z.string().min(1).trim(),
     *   email: z.string().email().trim().toLowerCase(),
     * }));
     *
     * User.from({ name: 'John Doe ', email: 'John@example.com' });
     * // ✅ Ok: returns { name: 'John Doe', email: 'john@example.com' }
     *
     * User.from({ name: '', email: '' });
     * // ❌ Runtime Error: validation failed
     *
     * User.from({ name: 'John' });
     * // ❌ TypeScript Error: missing properties
     *
     * User.from('string');
     * // ❌ TypeScript Error: wrong type
     * ```
     */
    from: (value: StandardSchemaV1.InferInput<S>) => validate(schema, value),

    /**
     * Validates and converts unknown data to the model's output type.
     *
     * @param value - Any value that should be validated against the model schema
     * @returns The validated and potentially transformed data
     * @throws {ModelValidationError} When the input data doesn't match the schema
     *
     * @example
     * ```typescript
     * const User = createModel(z.object({
     *   name: z.string().min(1).trim(),
     *   email: z.string().email().trim().toLowerCase(),
     * }));
     *
     * User.cast({ name: 'John Doe ', email: 'John@example.com' });
     * // ✅ Ok: returns { name: 'John Doe', email: 'john@example.com' }
     *
     * User.cast({ name: '', email: '' });
     * // ❌ Runtime Error: validation failed
     *
     * User.cast({ name: 'John' });
     * // ❌ Runtime Error: missing properties
     *
     * User.cast('string');
     * // ❌ Runtime Error: wrong type
     * ```
     */
    cast: (value: unknown) => validate(schema, value),
  });
}

export function validate<S extends StandardSchemaV1>(schema: S, value: unknown): StandardSchemaV1.InferOutput<S> {
  const result = getSyncValidationResult(schema, value);

  if (result.issues) {
    throw new ModelValidationError(result.issues);
  }

  return result.value;
}

export { ModelValidationError };
