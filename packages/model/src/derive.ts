import type { Model, SafeModel } from './types.js';

type BaseProp = 'schema' | 'is' | 'from' | 'cast' | 'safeFrom' | 'safeCast' | 'unsafeFrom' | 'unsafeCast';
const baseProps = new Set(['schema', 'is', 'from', 'cast', 'safeFrom', 'safeCast', 'unsafeFrom', 'unsafeCast']);

/**
 * Derives extensions from a given model.
 *
 * Extensions are properties and methods you define as the second argument in model creation function.
 *
 * @template M - Type of the model
 * @template K - Type of the extension keys to pick from the model
 * @param model - The source model to derive properties from
 * @param keys - Optional array of specific extension keys to pick. If not provided, picks all extensions
 * @returns An object containing only the selected extensions from the model
 *
 * @example
 * ```typescript
 * const Person = createModel(z.object({ name: z.string() }), {
 *   greet: (p: { name: string }) => `Hello, ${p.name}!`,
 * });
 *
 * const Employee = createModel(Person.schema.extend({
 *   id: z.string(),
 * }), {
 *   ...derive(Person),
 *   getBadge: (emp: { id: string }) => `EMP-${emp.id}`,
 * });
 *
 * const emp = Employee.from({ name: 'John', id: '123' });
 * Employee.greet(emp);    // "Hello, John!"
 * Employee.getBadge(emp); // "EMP-123"
 * ```
 */
export function derive<
  M extends Model<any> | SafeModel<any>,
  const K extends Exclude<keyof M, BaseProp> = Exclude<keyof M, BaseProp>,
>(model: M, keys?: K[]): Pick<M, K> {
  const toPick = keys ?? (Object.keys(model).filter((key) => !baseProps.has(key)) as K[]);

  return toPick.reduce(
    (acc, key) => {
      acc[key] = model[key];
      return acc;
    },
    {} as Pick<M, K>,
  );
}
