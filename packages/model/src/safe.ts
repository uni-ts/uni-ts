import type { Result } from '@uni-ts/result';
import { err, ok } from '@uni-ts/result';
import { getSyncValidationResult } from './helpers.js';
import { createModel } from './index.js';
import type { StandardSchemaV1 } from './standard-schema.js';

export function createSafeModel<S extends StandardSchemaV1>(schema: S) {
  return createModel(schema).extend({
    from: (value: StandardSchemaV1.InferInput<S>) => safeValidate(schema, value),
    cast: (value: unknown) => safeValidate(schema, value),
  });
}

export function createSafeFirstModel<S extends StandardSchemaV1>(schema: S) {
  return createModel(schema).extend((current) => ({
    from: (value: StandardSchemaV1.InferInput<S>) => safeValidate(schema, value),
    cast: (value: unknown) => safeValidate(schema, value),
    unsafeFrom: current.from,
    unsafeCast: current.cast,
  }));
}

export function createUnsafeFirstModel<S extends StandardSchemaV1>(schema: S) {
  return createModel(schema).extend(() => ({
    safeFrom: (value: StandardSchemaV1.InferInput<S>) => safeValidate(schema, value),
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

export type { InferModelType } from './index.js';
export { ModelValidationError };
