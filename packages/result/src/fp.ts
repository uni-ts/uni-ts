import type { InferValueAsErr, InferValueAsOk, NonPromise, OrFunction, OrPromise } from './helpers.js';
import { isPromise } from './helpers.js';
import type { Result, UnwrapErr, UnwrapOk } from './index.js';
import { mapErr as _mapErr, mapOk as _mapOk, match as _match, unwrapOr as _unwrapOr } from './index.js';

/**
 * Takes the error handler and returns a function that accepts a Result.
 * The returned function unwraps the Result, returning the data for Ok results and handling Err results using the provided error handler.
 *
 * @template R - The input Result type
 * @template ErrReturn - The type returned for Err results
 * @param onErr - The value or function that determines the value returned for Err results
 * @returns A function that takes a Result and returns either the Ok data or the error value
 *
 * @example
 * ```typescript
 * const result1 = pipe(ok("hello"), unwrapOr("default")); // "hello"
 * const result2 = pipe(err("failed"), unwrapOr("default")); // "default"
 * ```
 */
export function unwrapOr<R extends Result, const ErrReturn>(
  onErr: (error: UnwrapErr<R>) => NonPromise<ErrReturn>,
): (result: NonPromise<R>) => UnwrapOk<R> | ErrReturn;
export function unwrapOr<R extends Result, const ErrReturn>(
  onErr: NonPromise<ErrReturn>,
): (result: NonPromise<R>) => UnwrapOk<R> | ErrReturn;
export function unwrapOr<R extends OrPromise<Result>, const ErrReturn>(
  onErr: OrFunction<OrPromise<ErrReturn>, [error: UnwrapErr<R>]>,
): (result: R) => Promise<UnwrapOk<R> | ErrReturn>;
export function unwrapOr<R extends OrPromise<Result>, const ErrReturn>(
  onErr: OrFunction<OrPromise<ErrReturn>, [error: UnwrapErr<R>]>,
): (result: R) => OrPromise<UnwrapOk<R> | ErrReturn> {
  return (result: R) => _unwrapOr(result, onErr);
}

/**
 * Takes a mapper function and returns a function that accepts a Result.
 * The returned function transforms the data for Ok results using the mapper, while passing Err results unchanged.
 *
 * @template R - The input Result type
 * @template MapperReturn - The type returned by the mapper function
 * @param fn - Function to transform the Ok data
 * @returns A function that takes a Result and returns a new Result with transformed data
 *
 * @example
 * ```typescript
 * const result = pipe(
 *   ok(42),
 *   mapOk((x) => x * 2),         // Ok<84>
 *   mapOk((x) => x.toString()),  // Ok<"84">
 * );
 *
 * const errorResult = pipe(
 *   err("network error"),
 *   mapOk((x) => x * 2),         // Err<"network error"> (unchanged)
 *   mapOk((x) => x.toString())   // Err<"network error"> (unchanged)
 * );
 * ```
 */
export function mapOk<R extends Result, const MapperReturn>(
  fn: (data: UnwrapOk<R>) => NonPromise<MapperReturn>,
): (result: NonPromise<R>) => Result<InferValueAsOk<MapperReturn>, UnwrapErr<R | MapperReturn>>;
export function mapOk<R extends Result, const MapperReturn>(
  fn: (data: UnwrapOk<R>) => OrPromise<MapperReturn>,
): (result: OrPromise<R>) => Promise<Result<InferValueAsOk<MapperReturn>, UnwrapErr<R | MapperReturn>>>;
export function mapOk<R extends Result, const MapperReturn>(
  fn: (data: UnwrapOk<R>) => OrPromise<MapperReturn>,
): (result: OrPromise<R>) => OrPromise<Result<InferValueAsOk<MapperReturn>, UnwrapErr<R | MapperReturn>>> {
  return (result) => _mapOk(result, fn);
}

/**
 * Takes a mapper function and returns a function that accepts a Result.
 * The returned function transforms the error of Err results using the mapper, while passing Ok results unchanged.
 *
 * @template R - The input Result type
 * @template MapperReturn - The type returned by the mapper function
 * @param fn - Function to transform the Err data
 * @returns A function that takes a Result and returns a new Result with transformed error
 *
 * @example
 * ```typescript
 * const result = pipe(
 *   err("network error"),
 *   mapErr((error) => String(error)), // Err<string>
 *   mapErr((error) => ({ error })),   // Err<{ error: string }>
 * );
 *
 * const okResult = pipe(
 *   ok("success"),
 *   mapErr((error) => String(error)), // Ok<"success"> (unchanged)
 *   mapErr((error) => ({ error })),   // Ok<"success"> (unchanged)
 * );
 * ```
 */
export function mapErr<R extends Result, const MapperReturn>(
  fn: (data: UnwrapErr<R>) => NonPromise<MapperReturn>,
): (result: NonPromise<R>) => Result<UnwrapOk<R | MapperReturn>, InferValueAsErr<MapperReturn>>;
export function mapErr<R extends Result, const MapperReturn>(
  fn: (data: UnwrapErr<R>) => OrPromise<MapperReturn>,
): (result: OrPromise<R>) => Promise<Result<UnwrapOk<R | MapperReturn>, InferValueAsErr<MapperReturn>>>;
export function mapErr<R extends Result, const MapperReturn>(
  fn: (data: UnwrapErr<R>) => OrPromise<MapperReturn>,
): (result: OrPromise<R>) => OrPromise<Result<UnwrapOk<R | MapperReturn>, InferValueAsErr<MapperReturn>>> {
  return (result) => _mapErr(result, fn);
}

/**
 * Takes handlers for Ok and Err results and returns a function that accepts a Result.
 * The returned function pattern matches on the Result, calling the appropriate handler and returning its result.
 *
 * @template R - The input Result type
 * @template OkReturn - The type returned by the success handler
 * @template ErrReturn - The type returned by the error handler
 * @param onOk - Function to handle Ok results
 * @param onErr - Function to handle Err results
 * @returns A function that takes a Result object and returns the result of the appropriate handler
 *
 * @example
 * ```typescript
 * const result1 = pipe(ok("hello"), match(
 *   (data: string) => `Success: ${data}`,
 *   (error: string) => `Error: ${error}`
 * )); // "Success: hello"
 *
 * const result2 = pipe(err("failed"), match(
 *   (data: string) => `Success: ${data}`,
 *   (error: string) => `Error: ${error}`
 * )); // "Error: failed"
 * ```
 */
export function match<R extends Result, const OkReturn, const ErrReturn>(
  onOk: (data: UnwrapOk<R>) => NonPromise<OkReturn>,
  onErr: (error: UnwrapErr<R>) => NonPromise<ErrReturn>,
): (result: NonPromise<R>) => OkReturn | ErrReturn;
export function match<R extends Result, const OkReturn, const ErrReturn>(
  onOk: (data: UnwrapOk<R>) => OrPromise<OkReturn>,
  onErr: (error: UnwrapErr<R>) => OrPromise<ErrReturn>,
): (result: OrPromise<R>) => Promise<OkReturn | ErrReturn>;
export function match<R extends Result, const OkReturn, const ErrReturn>(
  onOk: (data: UnwrapOk<R>) => OrPromise<OkReturn>,
  onErr: (error: UnwrapErr<R>) => OrPromise<ErrReturn>,
): (result: OrPromise<R>) => OrPromise<OkReturn | ErrReturn> {
  return (result) => _match(result, onOk, onErr);
}

/**
 * Takes a side-effect function and returns a function that accepts a Result.
 * The returned function passes the Result through the side-effect function and returns the original Result unchanged.
 *
 * Useful for debugging, logging, or performing side effects without modifying the Result.
 *
 * @template R - The input Result type
 * @template FnReturn - The return type of the side-effect function (ignored)
 * @param fn - Side-effect function to execute with the Result
 * @returns A function that takes a Result, executes the side-effect function, and returns the original Result
 *
 * @example
 * ```typescript
 * const result = pipe(
 *   ok("hello"),
 *   tap((result) => {
 *     console.log("Result:", result); // Logs the result (side-effect)
 *     return "something"; // Return value is ignored
 *   }),
 *   mapOk((data) => data.toUpperCase()), // Original result is passed through
 * ); // { success: true, data: "HELLO" }
 * ```
 */
export function tap<R extends Result, FnReturn>(
  fn: (result: R) => NonPromise<FnReturn>,
): (result: R) => Result<UnwrapOk<R>, UnwrapErr<R>>;
export function tap<R extends OrPromise<Result>, FnReturn>(
  fn: (result: Awaited<R>) => OrPromise<FnReturn>,
): (result: R) => Promise<Result<UnwrapOk<R>, UnwrapErr<R>>>;
export function tap<R extends Result, FnReturn>(
  fn: (result: R) => OrPromise<FnReturn>,
): (result: OrPromise<R>) => OrPromise<Result<UnwrapOk<R>, UnwrapErr<R>>> {
  return (result) => {
    if (isPromise(result)) {
      return result.then(async (r) => {
        await fn(r);
        return r;
      });
    }

    const data = fn(result);

    return isPromise(data) ? data.then(() => result) : result;
  };
}

export type {
  Err,
  ExtractErr,
  ExtractOk,
  FlattenErr,
  FlattenOk,
  InferErr,
  InferOk,
  Ok,
  Result,
  UnknownResult,
  UnwrapErr,
  UnwrapOk,
} from './index.js';
export {
  err,
  fromThrowable,
  isErr,
  isErrResult,
  isOk,
  isOkResult,
  isResult,
  ok,
  toThrowable,
  toTuple,
  tryCatch,
  unwrapOrNull,
  unwrapOrThrow,
  unwrapOrUndefined,
} from './index.js';
