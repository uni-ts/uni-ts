import type { StandardSchemaV1 } from './standard-schema.js';

export function getSyncValidationResult<S extends StandardSchemaV1, V>(
  schema: S,
  value: V,
): StandardSchemaV1.Result<StandardSchemaV1.InferOutput<S>> {
  const result = schema['~standard'].validate(value);

  if (result instanceof Promise) {
    throw new TypeError('Schema validation must be synchronous');
  }

  return result;
}

export function oneOf<const T extends unknown[]>(...values: T): T[number] {
  return values[Math.floor(Math.random() * values.length)];
}

export function merge<const T, const E>(model: T, extend: E): Merge<T, E> {
  return { ...model, ...extend } as Merge<T, E>;
}

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

export type Merge<Destination, Source> = Simplify<
  {
    [Key in keyof Destination as Key extends keyof Source ? never : Key]: Destination[Key];
  } & Source
>;
