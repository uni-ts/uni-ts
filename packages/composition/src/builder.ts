import type { Fn, IsAsync, Or } from './helpers.js';
import { flow as _flow, pipe as _pipe } from './index.js';

/**
 * Creates function that applies given series of functions in order.
 *
 * Uses a fluent builder for constructing function compositions using method chaining.
 *
 * It's an alternative syntax for creating complex compositions with the `flow` function.
 * Instead of nesting function calls, you can chain `.andThen()` calls to build your pipeline step by step,
 * then call `.create()` to get the final composed function.
 *
 * Unlike the typical `flow` function, it doesn't have a limit on the number of functions that can be chained.
 *
 * @example
 * ```typescript
 * const transform = flow((x: number) => x * 2)
 *   .andThen((x) => x + 1)
 *   .andThen((x) => x.toString())
 *   .create(); // (x: number) => string
 *
 * const result = transform(5); // "11"
 * ```
 *
 * @example
 * ```typescript
 * const asyncTransform = flow((x: number) => x * 2)
 *   .andThen(async (x) => Promise.resolve(x + 1))
 *   .andThen((x) => x.toString())
 *   .create(); // (x: number) => Promise<string>
 *
 * const result = await asyncTransform(5); // "11"
 * ```
 *
 * @template InitArg The input type of the initial function
 * @template InitReturn The return type of the initial function
 * @param fn The initial function to start the composition with
 * @returns A builder object with `andThen()` method for chaining more functions and `create()` method to build the final composed function
 */
export function flow<InitArg, InitReturn>(fn: Fn<InitArg, InitReturn>) {
  const fns: Fn[] = [];

  function builder<Arg, Return, Async extends boolean>(fn: Fn<Arg, Return>) {
    fns.push(fn);

    return {
      andThen: <NextReturn>(nextFn: Fn<Return, NextReturn>) =>
        builder<Return, NextReturn, IsAsync<Async, Return>>(nextFn),
      create: () =>
        _flow(...fns) as (arg: Awaited<InitArg>) => Async extends true ? Promise<Awaited<Return>> : Awaited<Return>,
    };
  }

  return builder<InitArg, InitReturn, IsAsync<false, InitReturn>>(fn);
}

/**
 * Immediately applies (pipes) a value through a series of functions in order.
 *
 * Uses a fluent builder for applying transformations to a value using method chaining.
 *
 * It's an alternative syntax for creating complex compositions with the `pipe` function.
 * Instead of nesting function calls, you can chain `.andThen()` calls to build your pipeline step by step,
 * then call `.run()` to get the final result.
 *
 * Unlike the `pipe` function, it doesn't have a limit on the number of functions that can be chained.
 *
 * @example
 * ```typescript
 * const result = pipe(5)
 *   .andThen((x) => x * 2)
 *   .andThen((x) => x + 1)
 *   .andThen((x) => x.toString())
 *   .run(); // "11"
 * ```
 *
 * @example
 * ```typescript
 * const result = await pipe(5)
 *   .andThen((x) => x * 2)
 *   .andThen(async (x) => Promise.resolve(x + 1))
 *   .andThen((x) => x.toString())
 *   .run(); // "11"
 * ```
 *
 * @template InitArg The type of the initial value
 * @param arg The initial value to transform
 * @returns A builder object with `andThen()` method for chaining transformations and `run()` method to execute the pipeline
 */
export function pipe<InitArg>(arg: InitArg) {
  const fns: Fn[] = [];

  function builder<Arg, Return, Async extends boolean>(fn: Fn<Arg, Return>) {
    fns.push(fn);

    return {
      andThen: <NextReturn>(nextFn: Fn<Return, NextReturn>) =>
        builder<Return, NextReturn, IsAsync<Async, Return>>(nextFn),
      run: () => _pipe(arg, ...fns) as Async extends true ? Promise<Awaited<Return>> : Awaited<Return>,
    };
  }

  return {
    andThen: <NextReturn>(nextFn: Fn<InitArg, NextReturn>) =>
      builder<InitArg, NextReturn, Or<IsAsync<false, InitArg>, IsAsync<false, NextReturn>>>(nextFn),
  };
}
