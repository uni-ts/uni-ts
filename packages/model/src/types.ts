import type { Result } from '@uni-ts/result';
import type { ModelValidationError } from './error.js';
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

export interface Model<S extends StandardSchemaV1> {
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
  readonly schema: S;

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
  readonly is: (value: unknown) => value is StandardSchemaV1.InferOutput<S>;

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
  readonly from: (value: StandardSchemaV1.InferInput<S>) => StandardSchemaV1.InferOutput<S>;

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
  readonly cast: (value: unknown) => StandardSchemaV1.InferOutput<S>;
}

export interface SafeModel<S extends StandardSchemaV1> {
  /**
   * The underlying validation schema used by the model.
   *
   * @example
   * ```typescript
   * const Todo = createSafeModel(z.object({
   *   name: z.string(),
   *   completed: z.boolean()
   * }));
   *
   * const TodoList = createSafeModel(z.object({
   *   name: z.string(),
   *   todos: z.array(Todo.schema)
   * }));
   * ```
   */
  readonly schema: S;

  /**
   * Type guard that checks if a value matches the model's schema.
   *
   * @param value - The value to check against the model schema
   * @returns `true` if the value is valid according to the schema, `false` otherwise
   *
   * @example
   * ```typescript
   * const User = createSafeModel(z.object({ name: z.string() }));
   *
   * async function fetchUser(data: unknown) {
   *   const response = await fetch('/api/user').then(res => res.json());
   *
   *   return User.is(response) ? response : null;
   * }
   * ```
   */
  readonly is: (value: unknown) => value is StandardSchemaV1.InferOutput<S>;

  /**
   * Safely validates and converts data that matches the model's input type to the model's output type.
   * Returns a Result instead of throwing errors on validation failure.
   *
   * @param value - Data matching the model's input type
   * @returns Result containing either the validated data or validation error
   *
   * @example
   * ```typescript
   * const User = createSafeModel(z.object({
   *   name: z.string().min(1),
   *   email: z.string().email(),
   * }));
   *
   * const okResult = User.from({ name: 'John', email: 'john@example.com' });
   * // Type: Result<User, ModelValidationError>
   * // Value: { success: true, data: { name: 'John', email: 'john@example.com' } }
   *
   * const errResult = User.from({ name: '', email: 'invalid' });
   * // Type: Result<User, ModelValidationError>
   * // Value: { success: false, error: ModelValidationError }
   * ```
   */
  readonly from: (
    value: StandardSchemaV1.InferInput<S>,
  ) => Result<StandardSchemaV1.InferOutput<S>, ModelValidationError>;

  /**
   * Safely validates and converts unknown data to the model's output type.
   * Returns a Result instead of throwing errors on validation failure.
   *
   * @param value - Any value that should be validated against the model schema
   * @returns Result containing either the validated data or validation error
   *
   * @example
   * ```typescript
   * const User = createSafeModel(z.object({
   *   name: z.string().min(1),
   *   email: z.string().email(),
   * }));
   *
   * const okResult = User.cast({ name: 'John', email: 'john@example.com' });
   * // Type: Result<User, ModelValidationError>
   * // Value: { success: true, data: { name: 'John', email: 'john@example.com' } }
   *
   * const errResult = User.cast('invalid data');
   * // Type: Result<User, ModelValidationError>
   * // Value: { success: false, error: ModelValidationError }
   * ```
   */
  readonly cast: (value: unknown) => Result<StandardSchemaV1.InferOutput<S>, ModelValidationError>;
}

export interface SafeFirstModel<S extends StandardSchemaV1> {
  /**
   * The underlying validation schema used by the model.
   *
   * @example
   * ```typescript
   * const Todo = createSafeFirstModel(z.object({
   *   name: z.string(),
   *   completed: z.boolean()
   * }));
   *
   * const TodoList = createSafeFirstModel(z.object({
   *   name: z.string(),
   *   todos: z.array(Todo.schema)
   * }));
   * ```
   */
  readonly schema: S;

  /**
   * Type guard that checks if a value matches the model's schema.
   *
   * @param value - The value to check against the model schema
   * @returns `true` if the value is valid according to the schema, `false` otherwise
   *
   * @example
   * ```typescript
   * const User = createSafeFirstModel(z.object({ name: z.string() }));
   *
   * async function fetchUser(data: unknown) {
   *   const response = await fetch('/api/user').then(res => res.json());
   *
   *   return User.is(response) ? response : null;
   * }
   * ```
   */
  readonly is: (value: unknown) => value is StandardSchemaV1.InferOutput<S>;

  /**
   * Safely validates and converts data that matches the model's input type to the model's output type.
   * Returns a Result instead of throwing errors on validation failure.
   *
   * @param value - Data matching the model's input type
   * @returns Result containing either the validated data or validation error
   *
   * @example
   * ```typescript
   * const User = createSafeFirstModel(z.object({
   *   name: z.string().min(1),
   *   email: z.string().email(),
   * }));
   *
   * const okResult = User.from({ name: 'John', email: 'john@example.com' });
   * // Type: Result<User, ModelValidationError>
   * // Value: { success: true, data: { name: 'John', email: 'john@example.com' } }
   *
   * const errResult = User.from({ name: '', email: 'invalid' });
   * // Type: Result<User, ModelValidationError>
   * // Value: { success: false, error: ModelValidationError }
   * ```
   */
  readonly from: (
    value: StandardSchemaV1.InferInput<S>,
  ) => Result<StandardSchemaV1.InferOutput<S>, ModelValidationError>;

  /**
   * Safely validates and converts unknown data to the model's output type.
   * Returns a Result instead of throwing errors on validation failure.
   *
   * @param value - Any value that should be validated against the model schema
   * @returns Result containing either the validated data or validation error
   *
   * @example
   * ```typescript
   * const User = createSafeFirstModel(z.object({
   *   name: z.string().min(1),
   *   email: z.string().email(),
   * }));
   *
   * const okResult = User.cast({ name: 'John', email: 'john@example.com' });
   * // Type: Result<User, ModelValidationError>
   * // Value: { success: true, data: { name: 'John', email: 'john@example.com' } }
   *
   * const errResult = User.cast('invalid data');
   * // Type: Result<User, ModelValidationError>
   * // Value: { success: false, error: ModelValidationError }
   * ```
   */
  readonly cast: (value: unknown) => Result<StandardSchemaV1.InferOutput<S>, ModelValidationError>;

  /**
   * Validates and converts data that matches the model's input type to the model's output type.
   *
   * @param value - Data matching the model's input type
   * @returns The validated and potentially transformed data
   * @throws {ModelValidationError} When the input data doesn't match the schema
   *
   * @example
   * ```typescript
   * const User = createSafeFirstModel(z.object({
   *   name: z.string().min(1).trim(),
   *   email: z.string().email().trim().toLowerCase(),
   * }));
   *
   * User.unsafeFrom({ name: 'John Doe ', email: 'John@example.com' });
   * // ✅ Ok: returns { name: 'John Doe', email: 'john@example.com' }
   *
   * User.unsafeFrom({ name: '', email: '' });
   * // ❌ Runtime Error: validation failed
   *
   * User.unsafeFrom({ name: 'John' });
   * // ❌ TypeScript Error: missing properties
   *
   * User.unsafeFrom('string');
   * // ❌ TypeScript Error: wrong type
   * ```
   */
  readonly unsafeFrom: (value: StandardSchemaV1.InferInput<S>) => StandardSchemaV1.InferOutput<S>;

  /**
   * Validates and converts unknown data to the model's output type.
   *
   * @param value - Any value that should be validated against the model schema
   * @returns The validated and potentially transformed data
   * @throws {ModelValidationError} When the input data doesn't match the schema
   *
   * @example
   * ```typescript
   * const User = createSafeFirstModel(z.object({
   *   name: z.string().min(1).trim(),
   *   email: z.string().email().trim().toLowerCase(),
   * }));
   *
   * User.unsafeCast({ name: 'John Doe ', email: 'John@example.com' });
   * // ✅ Ok: returns { name: 'John Doe', email: 'john@example.com' }
   *
   * User.unsafeCast({ name: '', email: '' });
   * // ❌ Runtime Error: validation failed
   *
   * User.unsafeCast({ name: 'John' });
   * // ❌ Runtime Error: missing properties
   *
   * User.unsafeCast('string');
   * // ❌ Runtime Error: wrong type
   * ```
   */
  readonly unsafeCast: (value: unknown) => StandardSchemaV1.InferOutput<S>;
}

export interface UnsafeFirstModel<S extends StandardSchemaV1> {
  /**
   * The underlying validation schema used by the model.
   *
   * @example
   * ```typescript
   * const Todo = createUnsafeFirstModel(z.object({
   *   name: z.string(),
   *   completed: z.boolean()
   * }));
   *
   * const TodoList = createUnsafeFirstModel(z.object({
   *   name: z.string(),
   *   todos: z.array(Todo.schema)
   * }));
   * ```
   */
  readonly schema: S;

  /**
   * Type guard that checks if a value matches the model's schema.
   *
   * @param value - The value to check against the model schema
   * @returns `true` if the value is valid according to the schema, `false` otherwise
   *
   * @example
   * ```typescript
   * const User = createUnsafeFirstModel(z.object({ name: z.string() }));
   *
   * async function fetchUser(data: unknown) {
   *   const response = await fetch('/api/user').then(res => res.json());
   *
   *   return User.is(response) ? response : null;
   * }
   * ```
   */
  readonly is: (value: unknown) => value is StandardSchemaV1.InferOutput<S>;

  /**
   * Validates and converts data that matches the model's input type to the model's output type.
   *
   * @param value - Data matching the model's input type
   * @returns The validated and potentially transformed data
   * @throws {ModelValidationError} When the input data doesn't match the schema
   *
   * @example
   * ```typescript
   * const User = createUnsafeFirstModel(z.object({
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
  readonly from: (value: StandardSchemaV1.InferInput<S>) => StandardSchemaV1.InferOutput<S>;

  /**
   * Validates and converts unknown data to the model's output type.
   *
   * @param value - Any value that should be validated against the model schema
   * @returns The validated and potentially transformed data
   * @throws {ModelValidationError} When the input data doesn't match the schema
   *
   * @example
   * ```typescript
   * const User = createUnsafeFirstModel(z.object({
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
  readonly cast: (value: unknown) => StandardSchemaV1.InferOutput<S>;

  /**
   * Safely validates and converts data that matches the model's input type to the model's output type.
   * Returns a Result instead of throwing errors on validation failure.
   *
   * @param value - Data matching the model's input type
   * @returns Result containing either the validated data or validation error
   *
   * @example
   * ```typescript
   * const User = createUnsafeFirstModel(z.object({
   *   name: z.string().min(1),
   *   email: z.string().email(),
   * }));
   *
   * const okResult = User.safeFrom({ name: 'John', email: 'john@example.com' });
   * // Type: Result<User, ModelValidationError>
   * // Value: { success: true, data: { name: 'John', email: 'john@example.com' } }
   *
   * const errResult = User.safeFrom({ name: '', email: 'invalid' });
   * // Type: Result<User, ModelValidationError>
   * // Value: { success: false, error: ModelValidationError }
   * ```
   */
  readonly safeFrom: (
    value: StandardSchemaV1.InferInput<S>,
  ) => Result<StandardSchemaV1.InferOutput<S>, ModelValidationError>;

  /**
   * Safely validates and converts unknown data to the model's output type.
   * Returns a Result instead of throwing errors on validation failure.
   *
   * @param value - Any value that should be validated against the model schema
   * @returns Result containing either the validated data or validation error
   *
   * @example
   * ```typescript
   * const User = createUnsafeFirstModel(z.object({
   *   name: z.string().min(1),
   *   email: z.string().email(),
   * }));
   *
   * const okResult = User.safeCast({ name: 'John', email: 'john@example.com' });
   * // Type: Result<User, ModelValidationError>
   * // Value: { success: true, data: { name: 'John', email: 'john@example.com' } }
   *
   * const errResult = User.safeCast('invalid data');
   * // Type: Result<User, ModelValidationError>
   * // Value: { success: false, error: ModelValidationError }
   * ```
   */
  readonly safeCast: (value: unknown) => Result<StandardSchemaV1.InferOutput<S>, ModelValidationError>;
}
