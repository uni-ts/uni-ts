import type { StandardSchemaV1 } from './standard-schema.js';

/**
 * Error thrown when data validation fails against a model's schema.
 *
 * Contains detailed information about all validation issues that occurred during validation.
 * The error message is set to the first issue's message for convenience.
 *
 * @example
 * ```typescript
 * import { createModel, ModelValidationError } from '@uni-ts/model';
 * import { z } from 'zod';
 *
 * const User = createModel(z.object({
 *   name: z.string().min(1),
 *   email: z.string().email(),
 * }));
 *
 * try {
 *   User.from({ name: '', email: 'invalid-email' });
 * } catch (error) {
 *   if (error instanceof ModelValidationError) {
 *     console.error('Issues:', error.issues);
 *   }
 * }
 * ```
 */
export class ModelValidationError extends Error {
  /**
   * Used to distinguish this error from others with the same shape.
   */
  readonly type = 'ModelValidationError';

  /**
   * Array of all validation issues that caused the error.
   * Each issue contains details about what validation rule failed and where.
   */
  public readonly issues: ReadonlyArray<StandardSchemaV1.Issue>;

  /**
   * Creates a new ModelValidationError with the provided validation issues.
   *
   * @param issues - Array of validation issues from the schema validation
   */
  constructor(issues: ReadonlyArray<StandardSchemaV1.Issue>) {
    super(issues[0]?.message);
    this.name = 'SchemaError';
    this.issues = issues;
  }
}
