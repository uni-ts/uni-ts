import type { Result } from '@uni-ts/result';
import { err, ok } from '@uni-ts/result';
import { ModelValidationError } from './error.js';
import { getSyncValidationResult, type Merge, merge } from './helpers.js';
import { createModel, validate } from './index.js';
import type { StandardSchemaV1 } from './standard-schema.js';
import type { SafeFirstModel, SafeModel, UnsafeFirstModel } from './types.js';

/**
 * Creates a safe model where all validation methods return Result types instead of throwing errors.
 * Replaces the default `from` and `cast` methods with safe versions.
 *
 * @template S - Type of the Standard Schema compatible validation schema
 * @param schema - A validation schema that follows the Standard Schema interface
 * @returns A model with safe validation methods that return Result types
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 * import { isOk } from '@uni-ts/result';
 *
 * type User = InferModelOutput<typeof User>; // { name: string; email: string }
 * const User = createModel(z.object({
 *   name: z.string().min(1),
 *   email: z.string().email(),
 * }));
 *
 * const result = User.from({ name: '', email: 'invalid' });
 *
 * if (isOk(result)) {
 *   console.log('Valid user:', result.value);
 * } else {
 *   console.log('Validation issues:', result.error);
 * }
 * ```
 */
export function createSafeModel<S extends StandardSchemaV1, const E extends Record<PropertyKey, unknown> = {}>(
  schema: S,
  extend?: E,
): Merge<SafeModel<S>, E> {
  return merge(
    createModel(schema, {
      from: (value: StandardSchemaV1.InferInput<S>) => safeValidate(schema, value),
      cast: (value: unknown) => safeValidate(schema, value),
    }),
    extend,
  );
}

/**
 * Creates a model where safe validation is the default behavior, with unsafe versions available as fallbacks.
 * The `from` and `cast` methods return Results, while `unsafeFrom` and `unsafeCast` throw errors.
 *
 * @template S - Type of the Standard Schema compatible validation schema
 * @param schema - A validation schema that follows the Standard Schema interface
 * @returns A model with safe methods as default and unsafe methods as alternatives
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 *
 * const User = createSafeFirstModel(z.object({
 *   name: z.string().min(1),
 *   email: z.string().email(),
 * }));
 *
 * const result = User.from({ name: 'John', email: 'john@example.com' });
 * // Result<User, ModelValidationError>
 *
 * const value = User.unsafeFrom({ name: 'John', email: 'john@example.com' });
 * // User (may throw ModelValidationError)
 * ```
 */
export function createSafeFirstModel<S extends StandardSchemaV1, const E extends Record<PropertyKey, unknown> = {}>(
  schema: S,
  extend?: E,
): Merge<SafeFirstModel<S>, E> {
  return merge(
    createSafeModel(schema, {
      unsafeFrom: (value: StandardSchemaV1.InferInput<S>) => validate(schema, value),
      unsafeCast: (value: unknown) => validate(schema, value),
    }),
    extend,
  );
}

/**
 * Creates a model where unsafe validation is the default behavior, with safe versions available as alternatives.
 * The `from` and `cast` methods throw errors, while `safeFrom` and `safeCast` return Results.
 *
 * @template S - Type of the Standard Schema compatible validation schema
 * @param schema - A validation schema that follows the Standard Schema interface
 * @returns A model with unsafe methods as default and safe methods as alternatives
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 *
 * const User = createUnsafeFirstModel(z.object({
 *   name: z.string().min(1),
 *   email: z.string().email(),
 * }));
 *
 * const value = User.from({ name: 'John', email: 'john@example.com' });
 * // User (may throw ModelValidationError)
 *
 * const result = User.safeFrom({ name: 'John', email: 'john@example.com' });
 * // Result<User, ModelValidationError>
 * ```
 */
export function createUnsafeFirstModel<S extends StandardSchemaV1, const E extends Record<PropertyKey, unknown> = {}>(
  schema: S,
  extend?: E,
): Merge<UnsafeFirstModel<S>, E> {
  return merge(
    createModel(schema, {
      safeFrom: (value: StandardSchemaV1.InferInput<S>) => safeValidate(schema, value),
      safeCast: (value: unknown) => safeValidate(schema, value),
    }),
    extend,
  );
}

function safeValidate<S extends StandardSchemaV1>(
  schema: S,
  value: unknown,
): Result<StandardSchemaV1.InferOutput<S>, ModelValidationError> {
  const result = getSyncValidationResult(schema, value);

  return result.issues ? err(new ModelValidationError(result.issues)) : ok(result.value);
}

export { derive } from './derive.js';
export { ModelValidationError, prettifyError } from './error.js';
export type { InferModelInput, InferModelOutput, SafeFirstModel, SafeModel, UnsafeFirstModel } from './types.js';
