/**
 * A generic function type that accepts an awaited value and returns any value.
 *
 * This type is used throughout the composition utilities to ensure type safety
 * when chaining functions together. The `Awaited<A>` input type ensures that
 * if the previous function in a chain returns a Promise, this function will
 * receive the resolved value rather than the Promise itself.
 *
 * @template A The input type (automatically inferred if it's a Promise)
 * @template R The return type
 */
export type Fn<A = any, R = any> = (arg: Awaited<A>) => R;

/**
 * A utility type that determines the final return type of a function composition.
 *
 * This type recursively examines a tuple of return types from a function chain
 * and determines whether the final result should be wrapped in a Promise.
 * If any function in the chain returns a Promise, the entire composition
 * becomes asynchronous and returns a Promise of the final value.
 *
 * @template V The final value type that would be returned
 * @template T A tuple of all return types in the function chain
 */
export type ReturnType<V, T extends unknown[]> = T extends [infer R, ...infer Rest]
  ? R extends Promise<unknown>
    ? Promise<Awaited<V>>
    : ReturnType<V, Rest>
  : V;

/**
 * A utility type that determines if a function chain should be considered asynchronous.
 *
 * This type helps the builder functions track whether any step in the composition
 * chain returns a Promise, which affects the final return type of the composed function.
 * Once any function in the chain is async, the entire chain becomes async.
 *
 * @template Current Whether the chain is already considered async
 * @template Return The return type of the current function being added to the chain
 */
export type IsAsync<Current extends boolean, Return> = [Return] extends [never]
  ? false
  : Current extends true
    ? true
    : Return extends Promise<unknown>
      ? true
      : false;

/**
 * A utility type that performs a logical OR operation on two boolean types.
 *
 * @template A The first boolean type
 * @template B The second boolean type
 */
export type Or<A, B> = A extends true ? true : B extends true ? true : false;
