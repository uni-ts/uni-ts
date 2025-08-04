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

export interface ExtendFn<T> {
  (extension: false): T;
  <const E>(extension: (model: T) => E): ExtendableModel<Merge<T, E>>;
  <const E>(extension: E): ExtendableModel<Merge<T, E>>;
}

type ExtendableModel<T> = Merge<T, { readonly extend: ExtendFn<T> }>;

export function createExtendableModel<const T>(model: T) {
  return {
    ...model,
    extend(extension: unknown) {
      if (extension === false) return model;

      return createExtendableModel({ ...model, ...(extension instanceof Function ? extension(model) : extension) });
    },
  } as ExtendableModel<T>;
}

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

type Merge<Destination, Source> = Simplify<
  {
    [Key in keyof Destination as Key extends keyof Source ? never : Key]: Destination[Key];
  } & Source
>;
