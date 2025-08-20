import { ModelValidationError } from './error.js';
import { getSyncValidationResult, type Merge, merge } from './helpers.js';
import type { StandardSchemaV1 } from './standard-schema.js';
import type { Model } from './types.js';

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
export function createModel<S extends StandardSchemaV1, const E extends Record<PropertyKey, unknown> = {}>(
  schema: S,
  extend?: E,
): Merge<Model<S>, E> {
  return merge(
    {
      schema,
      is: (value: unknown): value is StandardSchemaV1.InferOutput<S> => !getSyncValidationResult(schema, value).issues,
      from: (value: StandardSchemaV1.InferInput<S>) => validate(schema, value),
      cast: (value: unknown) => validate(schema, value),
    },
    extend,
  );
}

export function validate<S extends StandardSchemaV1>(schema: S, value: unknown): StandardSchemaV1.InferOutput<S> {
  const result = getSyncValidationResult(schema, value);

  if (result.issues) {
    throw new ModelValidationError(result.issues);
  }

  return result.value;
}

export { derive } from './derive.js';
export { ModelValidationError, prettifyError } from './error.js';
export type { InferModelInput, InferModelOutput, Model } from './types.js';
