import type { StandardSchemaV1 } from './standard-schema.js';

/** A model validation error with useful information. */
export class ModelValidationError extends Error {
  /** The model validation issues. */
  public readonly issues: ReadonlyArray<StandardSchemaV1.Issue>;

  /**
   * Creates a model validation error with useful information.
   *
   * @param issues The model validation issues.
   */
  constructor(issues: ReadonlyArray<StandardSchemaV1.Issue>) {
    super(issues[0]?.message);
    this.name = 'SchemaError';
    this.issues = issues;
  }
}
