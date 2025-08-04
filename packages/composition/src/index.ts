import type { Fn, ReturnType } from './helpers.js';

/**
 * Creates function that applies given series of functions in order.
 *
 * @example
 * ```typescript
 * const transform = flow(
 *   (x: number) => x * 2,
 *   (x) => x + 1,
 *   (x) => x.toString()
 * ); // (x: number) => string
 *
 * const result = transform(5); // "11"
 * ```
 *
 * @example
 * ```typescript
 * const asyncTransform = flow(
 *   (x: number) => x * 2,
 *   async (x) => Promise.resolve(x + 1),
 *   (x) => x.toString()
 * ); // (x: number) => Promise<string>
 *
 * const result = await asyncTransform(5); // "11"
 * ```
 *
 * @template A The input type of the first function
 * @template R1, R2, R3... The return types of each function in the composition
 * @param fns A series of functions to compose, where each function's input type matches the previous function's output
 * @returns A new function that applies all provided functions in sequence
 */
export function flow(): () => void;
export function flow<A, R1>(f1: Fn<A, R1>): (arg: A) => ReturnType<R1, [A, R1]>;
export function flow<A, R1, R2>(f1: Fn<A, R1>, f2: Fn<R1, R2>): (arg: A) => ReturnType<R2, [A, R1, R2]>;
export function flow<A, R1, R2, R3>(
  f1: Fn<A, R1>,
  f2: Fn<R1, R2>,
  f3: Fn<R2, R3>,
): (arg: A) => ReturnType<R3, [A, R1, R2, R3]>;
export function flow<A, R1, R2, R3, R4>(
  f1: Fn<A, R1>,
  f2: Fn<R1, R2>,
  f3: Fn<R2, R3>,
  f4: Fn<R3, R4>,
): (arg: A) => ReturnType<R4, [A, R1, R2, R3, R4]>;
export function flow<A, R1, R2, R3, R4, R5>(
  f1: Fn<A, R1>,
  f2: Fn<R1, R2>,
  f3: Fn<R2, R3>,
  f4: Fn<R3, R4>,
  f5: Fn<R4, R5>,
): (arg: A) => ReturnType<R5, [A, R1, R2, R3, R4, R5]>;
export function flow<A, R1, R2, R3, R4, R5, R6>(
  f1: Fn<A, R1>,
  f2: Fn<R1, R2>,
  f3: Fn<R2, R3>,
  f4: Fn<R3, R4>,
  f5: Fn<R4, R5>,
  f6: Fn<R5, R6>,
): (arg: A) => ReturnType<R6, [A, R1, R2, R3, R4, R5, R6]>;
export function flow<A, R1, R2, R3, R4, R5, R6, R7>(
  f1: Fn<A, R1>,
  f2: Fn<R1, R2>,
  f3: Fn<R2, R3>,
  f4: Fn<R3, R4>,
  f5: Fn<R4, R5>,
  f6: Fn<R5, R6>,
  f7: Fn<R6, R7>,
): (arg: A) => ReturnType<R7, [A, R1, R2, R3, R4, R5, R6, R7]>;
export function flow<A, R1, R2, R3, R4, R5, R6, R7, R8>(
  f1: Fn<A, R1>,
  f2: Fn<R1, R2>,
  f3: Fn<R2, R3>,
  f4: Fn<R3, R4>,
  f5: Fn<R4, R5>,
  f6: Fn<R5, R6>,
  f7: Fn<R6, R7>,
  f8: Fn<R7, R8>,
): (arg: A) => ReturnType<R8, [A, R1, R2, R3, R4, R5, R6, R7, R8]>;
export function flow<A, R1, R2, R3, R4, R5, R6, R7, R8, R9>(
  f1: Fn<A, R1>,
  f2: Fn<R1, R2>,
  f3: Fn<R2, R3>,
  f4: Fn<R3, R4>,
  f5: Fn<R4, R5>,
  f6: Fn<R5, R6>,
  f7: Fn<R6, R7>,
  f8: Fn<R7, R8>,
  f9: Fn<R8, R9>,
): (arg: A) => ReturnType<R9, [A, R1, R2, R3, R4, R5, R6, R7, R8, R9]>;
export function flow<A, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10>(
  f1: Fn<A, R1>,
  f2: Fn<R1, R2>,
  f3: Fn<R2, R3>,
  f4: Fn<R3, R4>,
  f5: Fn<R4, R5>,
  f6: Fn<R5, R6>,
  f7: Fn<R6, R7>,
  f8: Fn<R7, R8>,
  f9: Fn<R8, R9>,
  f10: Fn<R9, R10>,
): (arg: A) => ReturnType<R10, [A, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10]>;
export function flow<A>(...fns: Fn[]): Fn<A, unknown>;
export function flow<A>(...fns: Fn[]): Fn<A, unknown> {
  return (arg: A) => {
    let result: unknown = arg;

    for (const fn of fns) {
      if (result instanceof Promise) {
        return result.then(async (r) => {
          result = r;

          for (const asyncFn of fns.slice(fns.indexOf(fn))) {
            result = await asyncFn(result);
          }

          return result;
        });
      }

      result = fn(result);
    }

    return result;
  };
}

/**
 * Immediately applies (pipes) a value through a series of functions in order.
 *
 * The `pipe` function is similar to `flow`, but instead of returning a composed function,
 * it immediately executes the function chain with the provided initial value.
 *
 * @example
 * ```typescript
 * const result = pipe(
 *   5,
 *   (x) => x * 2,
 *   (x) => x + 1,
 *   (x) => x.toString()
 * ); // "11"
 * ```
 *
 * @example
 * ```typescript
 * const asyncResult = await pipe(
 *   5,
 *   (x) => x * 2,
 *   async (x) => Promise.resolve(x + 1),
 *   (x) => x.toString()
 * ); // "11"
 * ```
 *
 * @template A The type of the initial value
 * @template R1, R2, R3... The return types of each function in the pipeline
 * @param arg The initial value to transform
 * @param fns A series of functions to apply in sequence, where each function's input type matches the previous function's output
 * @returns The final transformed value
 */
export function pipe<A>(arg: A): A;
export function pipe<A, R1>(arg: A, f1: Fn<A, R1>): ReturnType<R1, [A, R1]>;
export function pipe<A, R1, R2>(arg: A, f1: Fn<A, R1>, f2: Fn<R1, R2>): ReturnType<R2, [A, R1, R2]>;
export function pipe<A, R1, R2, R3>(
  arg: A,
  f1: Fn<A, R1>,
  f2: Fn<R1, R2>,
  f3: Fn<R2, R3>,
): ReturnType<R3, [A, R1, R2, R3]>;
export function pipe<A, R1, R2, R3, R4>(
  arg: A,
  f1: Fn<A, R1>,
  f2: Fn<R1, R2>,
  f3: Fn<R2, R3>,
  f4: Fn<R3, R4>,
): ReturnType<R4, [A, R1, R2, R3, R4]>;
export function pipe<A, R1, R2, R3, R4, R5>(
  arg: A,
  f1: Fn<A, R1>,
  f2: Fn<R1, R2>,
  f3: Fn<R2, R3>,
  f4: Fn<R3, R4>,
  f5: Fn<R4, R5>,
): ReturnType<R5, [A, R1, R2, R3, R4, R5]>;
export function pipe<A, R1, R2, R3, R4, R5, R6>(
  arg: A,
  f1: Fn<A, R1>,
  f2: Fn<R1, R2>,
  f3: Fn<R2, R3>,
  f4: Fn<R3, R4>,
  f5: Fn<R4, R5>,
  f6: Fn<R5, R6>,
): ReturnType<R6, [A, R1, R2, R3, R4, R5, R6]>;
export function pipe<A, R1, R2, R3, R4, R5, R6, R7>(
  arg: A,
  f1: Fn<A, R1>,
  f2: Fn<R1, R2>,
  f3: Fn<R2, R3>,
  f4: Fn<R3, R4>,
  f5: Fn<R4, R5>,
  f6: Fn<R5, R6>,
  f7: Fn<R6, R7>,
): ReturnType<R7, [A, R1, R2, R3, R4, R5, R6, R7]>;
export function pipe<A, R1, R2, R3, R4, R5, R6, R7, R8>(
  arg: A,
  f1: Fn<A, R1>,
  f2: Fn<R1, R2>,
  f3: Fn<R2, R3>,
  f4: Fn<R3, R4>,
  f5: Fn<R4, R5>,
  f6: Fn<R5, R6>,
  f7: Fn<R6, R7>,
  f8: Fn<R7, R8>,
): ReturnType<R8, [A, R1, R2, R3, R4, R5, R6, R7, R8]>;
export function pipe<A, R1, R2, R3, R4, R5, R6, R7, R8, R9>(
  arg: A,
  f1: Fn<A, R1>,
  f2: Fn<R1, R2>,
  f3: Fn<R2, R3>,
  f4: Fn<R3, R4>,
  f5: Fn<R4, R5>,
  f6: Fn<R5, R6>,
  f7: Fn<R6, R7>,
  f8: Fn<R7, R8>,
  f9: Fn<R8, R9>,
): ReturnType<R9, [A, R1, R2, R3, R4, R5, R6, R7, R8, R9]>;
export function pipe<A, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10>(
  arg: A,
  f1: Fn<A, R1>,
  f2: Fn<R1, R2>,
  f3: Fn<R2, R3>,
  f4: Fn<R3, R4>,
  f5: Fn<R4, R5>,
  f6: Fn<R5, R6>,
  f7: Fn<R6, R7>,
  f8: Fn<R7, R8>,
  f9: Fn<R8, R9>,
  f10: Fn<R9, R10>,
): ReturnType<R10, [A, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10]>;
export function pipe<A>(arg: A, ...fns: Fn[]): unknown;
export function pipe<A>(arg: A, ...fns: Fn[]): unknown {
  return flow(...fns)(arg);
}
