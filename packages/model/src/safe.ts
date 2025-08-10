import type { Result } from '@uni-ts/result';
import { err, ok } from '@uni-ts/result';
import { ModelValidationError } from './error.js';
import { getSyncValidationResult } from './helpers.js';
import { createModel } from './index.js';
import type { StandardSchemaV1 } from './standard-schema.js';

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
export function createSafeModel<S extends StandardSchemaV1>(schema: S) {
  return createModel(schema).extend({
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
    from: (value: StandardSchemaV1.InferInput<S>) => safeValidate(schema, value),

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
    cast: (value: unknown) => safeValidate(schema, value),
  });
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
export function createSafeFirstModel<S extends StandardSchemaV1>(schema: S) {
  return createModel(schema).extend((current) => ({
    /**
     * Safely validates and converts data that matches the model's input type to the model's output type.
     * Returns a Result instead of throwing errors on validation failure.
     *
     * @param value - Data matching the model's input type
     * @returns Result containing either the validated data or validation error
     */
    from: (value: StandardSchemaV1.InferInput<S>) => safeValidate(schema, value),

    /**
     * Safely validates and converts unknown data to the model's output type.
     * Returns a Result instead of throwing errors on validation failure.
     *
     * @param value - Any value that should be validated against the model schema
     * @returns Result containing either the validated data or validation error
     */
    cast: (value: unknown) => safeValidate(schema, value),

    /**
     * Validates and converts data that matches the model's input type to the model's output type.
     *
     * @param value - Data matching the model's input type
     * @returns The validated and potentially transformed data
     * @throws {ModelValidationError} When the input data doesn't match the schema
     */
    unsafeFrom: current.from,

    /**
     * Validates and converts unknown data to the model's output type.
     *
     * @param value - Any value that should be validated against the model schema
     * @returns The validated and potentially transformed data
     * @throws {ModelValidationError} When the input data doesn't match the schema
     */
    unsafeCast: current.cast,
  }));
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
export function createUnsafeFirstModel<S extends StandardSchemaV1>(schema: S) {
  return createModel(schema).extend(() => ({
    /**
     * Safely validates and converts data that matches the model's input type to the model's output type.
     * Returns a Result instead of throwing errors on validation failure.
     *
     * @param value - Data matching the model's input type
     * @returns Result containing either the validated data or validation issues
     */
    safeFrom: (value: StandardSchemaV1.InferInput<S>) => safeValidate(schema, value),

    /**
     * Safely validates and converts unknown data to the model's output type.
     * Returns a Result instead of throwing errors on validation failure.
     *
     * @param value - Any value that should be validated against the model schema
     * @returns Result containing either the validated data or validation issues
     */
    safeCast: (value: unknown) => safeValidate(schema, value),
  }));
}

function safeValidate<S extends StandardSchemaV1>(
  schema: S,
  value: unknown,
): Result<StandardSchemaV1.InferOutput<S>, ModelValidationError> {
  const result = getSyncValidationResult(schema, value);

  return result.issues ? err(new ModelValidationError(result.issues)) : ok(result.value);
}

export type { InferModelInput, InferModelOutput } from './index.js';
export { ModelValidationError };
