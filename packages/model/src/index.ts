import { ModelValidationError } from './error.js';
import { createExtendableModel, getSyncValidationResult } from './helpers.js';
import type { StandardSchemaV1 } from './standard-schema.js';

export type InferModelType<M extends { schema: StandardSchemaV1 }> = StandardSchemaV1.InferOutput<M['schema']>;

export function createModel<S extends StandardSchemaV1>(schema: S) {
  return createExtendableModel({
    schema,
    is: (value: unknown): value is StandardSchemaV1.InferOutput<S> => !getSyncValidationResult(schema, value).issues,
    from: (value: StandardSchemaV1.InferInput<S>) => validate(schema, value),
    cast: (value: unknown) => validate(schema, value),
  });
}

function validate<S extends StandardSchemaV1>(schema: S, value: unknown): StandardSchemaV1.InferOutput<S> {
  const result = getSyncValidationResult(schema, value);

  if (result.issues) {
    throw new ModelValidationError(result.issues);
  }

  return result.value;
}
