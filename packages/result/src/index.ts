import type {
  InferValueAsErr,
  InferValueAsOk,
  NonPromise,
  OrFunction,
  OrPromise,
  ResultTuple,
  Returned,
} from './helpers.js';
import { callOrFunction, isObject, isPromise, mapOrPromise } from './helpers.js';

/**
 * Represents a successful result containing data.
 *
 * This interface is part of a discriminated union with `Err` to create the `Result` type.
 * Use the `ok()` function to create instances rather than constructing manually.
 *
 * @template T - The type of the success data
 *
 * @example
 * ```typescript
 * const result: Ok<string> = ok("Hello");
 * console.log(result.success); // true
 * console.log(result.data); // "Hello"
 * ```
 */
export interface Ok<T = any> {
  success: true;
  data: T;
}

/**
 * Represents an error result containing an error value.
 *
 * This interface is part of a discriminated union with `Ok` to create the `Result` type.
 * Use the `err()` function to create instances rather than constructing manually.
 *
 * @template T - The type of the error data
 *
 * @example
 * ```typescript
 * const result: Err<string> = err("Something went wrong");
 * console.log(result.success); // false
 * console.log(result.error); // "Something went wrong"
 * ```
 */
export interface Err<T = any> {
  success: false;
  error: T;
}

/**
 * Represents the result of an operation that can either succeed with data or fail with an error.
 * This is a discriminated union of Ok and Err types where the `success` property is used as .
 *
 * @template Data - The type of the success data
 * @template Error - The type of the error data
 *
 * @example
 * ```typescript
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return err("Cannot divide by zero");
 *   return ok(a / b);
 * }
 *
 * const result = divide(10, 2);
 * if (result.success) {
 *   console.log(result.data); // 5
 * } else {
 *   console.log(result.error); // "Cannot divide by zero"
 * }
 * ```
 */
export type Result<Data = any, Error = any> = Ok<Data> | Err<Error>;

/**
 * A generic Result type with unknown data and error types.
 * Useful when you need to work with results but don't know the specific types.
 *
 * @example
 * ```typescript

 * function logResult(result: UnknownResult): void {
 *   console.log(result.success ? "✓" : "✗", result.success ? result.data : result.error);
 * }
 * ```
 */
export type UnknownResult = Result<unknown, unknown>;

/**
 * Extracts only the Ok types from a union type.
 *
 * @template T - The type to extract Ok types from
 *
 * @example
 * ```typescript
 * type T1 = ExtractOk<Ok<'x'> | Err<1> | Ok<true> | []>; // Ok<'x'> | Ok<true>
 * ```
 */
export type ExtractOk<T> = Extract<T, Ok>;

/**
 * Extracts only the Err types from a union type.
 *
 * @template T - The type to extract Err types from
 *
 * @example
 * ```typescript
 * type T1 = ExtractErr<Ok<'x'> | Err<1> | Err<true> | []>; // Err<1> | Err<true>
 * ```
 */
export type ExtractErr<T> = Extract<T, Err>;

/**
 * Extracts Ok types from a type, handling promises and function return types.
 * This utility unwraps promises and function return types before extracting Ok types.
 *
 * @template T - The type to extract Ok types from (can be a function or promise)
 *
 * @example
 * ```typescript
 * type T1 = InferOk<Result<string, Error>>; // Ok<string>
 * type T2 = InferOk<Promise<Result<string, Error>>>; // Ok<string>
 * type T3 = InferOk<() => Result<number, string>>; // Ok<number>
 * type T4 = InferOk<() => Promise<Result<User, ApiError>>>; // Ok<User>
 * ```
 */
export type InferOk<T> = ExtractOk<Awaited<Returned<T>>>;

/**
 * Extracts Err types from a type, handling promises and function return types.
 * This utility unwraps promises and function return types before extracting Err types.
 *
 * @template T - The type to extract Err types from (can be a function or promise)
 *
 * @example
 * ```typescript
 * type T1 = InferErr<Result<string, Error>>; // Err<Error>
 * type T2 = InferErr<Promise<Result<string, Error>>>; // Err<Error>
 * type T3 = InferErr<() => Result<number, string>>; // Err<string>
 * type T4 = InferErr<() => Promise<Result<User, ApiError>>>; // Err<ApiError>
 * ```
 */
export type InferErr<T> = ExtractErr<Awaited<Returned<T>>>;

/**
 * Extracts the data type from Ok results, handling promises and function return types.
 *
 * This utility extracts the inner data type from successful results, effectively
 * "unwrapping" the Ok wrapper to get to the actual data type. Returns never if
 * no Ok types are found in the input type.
 *
 * @template T - The type to extract data from
 *
 * @example
 * ```typescript
 * type T1 = UnwrapOk<Result<string, Error>>; // string
 * type T2 = UnwrapOk<Promise<Result<string, Error>>>; // string
 * type T3 = UnwrapOk<() => Result<number, string>>; // number
 * type T4 = UnwrapOk<() => Promise<Result<User, ApiError>>>; // User
 * ```
 */
export type UnwrapOk<T> = InferOk<T> extends never ? never : InferOk<T> extends Ok<infer R> ? R : never;

/**
 * Extracts the error type from Err results, handling promises and function return types.
 *
 * This utility extracts the inner error type from error results, effectively
 * "unwrapping" the Err wrapper to get to the actual error type. Returns never if
 * no Err types are found in the input type.
 *
 * @template T - The type to extract error from
 *
 * @example
 * ```typescript
 * type T1 = UnwrapErr<Result<string, Error>>; // Error
 * type T2 = UnwrapErr<Promise<Result<string, Error>>>; // Error
 * type T3 = UnwrapErr<() => Result<number, string>>; // string
 * type T4 = UnwrapErr<() => Promise<Result<User, ApiError>>>; // ApiError
 * ```
 */
export type UnwrapErr<T> = InferErr<T> extends never ? never : InferErr<T> extends Err<infer R> ? R : never;

/**
 * Extracts the data from Ok types, leaving non-Ok types unchanged.
 *
 * @template T - The type to potentially flatten
 *
 * @example
 * ```typescript
 * type T1 = FlattenOk<Ok<string>>; // string
 * type T2 = FlattenOk<string>; // string (unchanged)
 * type T3 = FlattenOk<Err<Error>>; // Err<Error> (unchanged)
 * type T4 = FlattenOk<Ok<User> | string | Err<Error>>; // User | string | Err<Error>
 * ```
 */
export type FlattenOk<T> = T extends Ok<infer R> ? R : T;

/**
 * Extracts the error from Err types, leaving non-Err types unchanged.
 *
 * @template T - The type to potentially flatten
 *
 * @example
 * ```typescript
 * type T1 = FlattenErr<Err<string>>; // string
 * type T2 = FlattenErr<string>; // string (unchanged)
 * type T3 = FlattenErr<Ok<number>>; // Ok<number> (unchanged)
 * type T4 = FlattenErr<Err<ApiError> | string | Ok<User>>; // ApiError | string | Ok<User>
 * ```
 */
export type FlattenErr<T> = T extends Err<infer R> ? R : T;

/**
 * Creates an Ok result containing the provided data.
 *
 * @template T - The type of the data
 * @param data - The success data to wrap in an Ok result
 * @returns An Ok result, or a Promise of an Ok result if the input is a Promise
 *
 * @example
 * ```typescript
 * const r1 = ok("hello"); // Ok<"hello">
 * ```
 */
export function ok<const T>(data: T): Ok<T> {
  return { success: true, data };
}

/**
 * Creates an Err result containing the provided error.
 *
 * @template T - The type of the error
 * @param error - The error data to wrap in an Err result
 * @returns An Err result, or a Promise of an Err result if the input is a Promise
 *
 * @example
 * ```typescript
 * const r1 = err("some error"); // Err<"some error">
 * ```
 */
export function err<const T>(error: T): Err<T> {
  return { success: false, error };
}

/**
 * Type guard that checks if a value is a valid Result (either Ok or Err).
 * Validates the structure to ensure it has the correct shape.
 *
 * @param value - The value to check
 * @returns `true` if the value is a valid Result, `false` otherwise
 *
 * @example
 * ```typescript
 * if (isResult(value)) {
 *   // value is now typed as Result
 *   if (value.success) {
 *     console.log(value.data);
 *   } else {
 *     console.log(someValue.error);
 *   }
 * }
 * ```
 */
export function isResult(value: unknown): value is Result {
  if (!isObject(value) || !('success' in value) || Object.keys(value).length !== 2) return false;

  return (value.success === true && 'data' in value) || (value.success === false && 'error' in value);
}

/**
 * Type guard that checks if a Result is an Ok (successful) result.
 *
 * @template T - The type of the success data
 * @param result - The Result to check
 * @returns True if the result is Ok, false if it's Err
 *
 * @example
 * ```typescript
 * const r: Result<string, Error> = ok("hello");
 *
 * if (isOk(r)) {
 *   // r is now typed as Ok<string>
 *   console.log(result.data); // "hello"
 * }
 * ```
 */
export function isOk<T>(result: Result<T, unknown>): result is Ok<T> {
  return result.success === true;
}

/**
 * Type guard that checks if an unknown value is an Ok result.
 * Unlike isOk, this accepts any unknown value and checks if it's a valid Ok result.
 *
 * @param value - The value to check
 * @returns True if the value is an Ok result, false otherwise
 *
 * @example
 * ```typescript
 * if (isOkResult(value)) {
 *   // value is now typed as Ok
 *   console.log(value.data);
 * }
 * ```
 */
export function isOkResult(value: unknown): value is Ok {
  return isResult(value) && isOk(value);
}

/**
 * Type guard that checks if a Result is an Err (error) result.
 *
 * @template E - The type of the error data
 * @param result - The Result to check
 * @returns True if the result is Err, false if it's Ok
 *
 * @example
 * ```typescript
 * const r: Result<string, Error> = err(new Error("failed"));
 *
 * if (isErr(r)) {
 *   // r is now typed as Err<Error>
 *   console.log(result.error.message);
 * }
 * ```
 */
export function isErr<E>(result: Result<unknown, E>): result is Err<E> {
  return result.success === false;
}

/**
 * Type guard that checks if an unknown value is an Err result.
 * Unlike isErr, this accepts any unknown value and checks if it's a valid Err result.
 *
 * @param value - The value to check
 * @returns True if the value is an Err result, false otherwise
 *
 * @example
 * ```typescript
 * if (isErrResult(value)) {
 *   // value is now typed as Err
 *   console.log(value.error);
 * }
 * ```
 */
export function isErrResult(value: unknown): value is Err {
  return isResult(value) && isErr(value);
}

/**
 * Unwraps a Result, returning the data for Ok results and handling Err results in a provided way.
 * The second argument can be a static value or a function that receives the error and returns a value.
 *
 * @template R - Type of the Result to unwrap
 * @template ErrReturn - Type of the value returned for Err results
 * @param result - The Result to unwrap
 * @param onErr - The value or function that determines the value returned for Err results
 * @returns Data from the Ok result or provided/computed value for Err results
 *
 * @example
 * ```typescript
 * unwrapOr(ok("hello"), "default"); // "hello"
 * unwrapOr(err("error"), "default"); // "default"
 * unwrapOr(err("error"), (error) => `Failed: ${error}`); // "Failed: error"
 * unwrapOr(Promise.resolve(err("error")), "default"); // Promise<"default">
 * ```
 */
export function unwrapOr<R extends Result, const ErrReturn>(
  result: NonPromise<R>,
  onErr: (error: UnwrapErr<R>) => NonPromise<ErrReturn>,
): UnwrapOk<R> | ErrReturn;
export function unwrapOr<R extends Result, const ErrReturn>(
  result: NonPromise<R>,
  onErr: NonPromise<ErrReturn>,
): UnwrapOk<R> | ErrReturn;
export function unwrapOr<R extends OrPromise<Result>, const ErrReturn>(
  result: R,
  onErr: OrFunction<OrPromise<ErrReturn>, [error: UnwrapErr<R>]>,
): Promise<UnwrapOk<R> | ErrReturn>;
export function unwrapOr<R extends OrPromise<Result>, const ErrReturn>(
  result: R,
  onErr: OrFunction<OrPromise<ErrReturn>, [error: UnwrapErr<R>]>,
): OrPromise<UnwrapOk<R> | ErrReturn> {
  return match(
    result,
    (data) => data,
    (error) => callOrFunction(onErr, error),
  );
}

/**
 * Unwraps a Result, returning the data for Ok results and throwing the error for Err results.
 * Useful for integrating Result-based functions with traditional throw-based code.
 *
 * @template R - Type of the Result to unwrap
 * @param result - The Result to unwrap
 * @returns Data from the Ok result
 * @throws Error from the Err result
 *
 * @example
 * ```typescript
 * unwrapOrThrow(ok("hello")); // "hello"
 * unwrapOrThrow(err(new Error("failed"))); // throws Error("failed")
 * ```
 */
export function unwrapOrThrow<R extends Result>(result: NonPromise<R>): UnwrapOk<R>;
export function unwrapOrThrow<R extends OrPromise<Result>>(result: R): Promise<UnwrapOk<R>>;
export function unwrapOrThrow<R extends OrPromise<Result>>(result: R): OrPromise<UnwrapOk<R>> {
  return unwrapOr(result, (ex) => {
    throw ex;
  });
}

/**
 * Unwraps a Result, returning the data for Ok results and null for Err results.
 * This is a convenience function that's equivalent to calling `unwrapOr(result, null)`.
 *
 * @template R - Type of the Result to unwrap
 * @param result - The Result to unwrap
 * @returns Data from the Ok result or null for Err results
 *
 * @example
 * ```typescript
 * unwrapOrNull(ok("hello")); // "hello"
 * unwrapOrNull(err("error")); // null
 * ```
 */
export function unwrapOrNull<R extends Result>(result: NonPromise<R>): UnwrapOk<R> | null;
export function unwrapOrNull<R extends OrPromise<Result>>(result: R): Promise<UnwrapOk<R> | null>;
export function unwrapOrNull<R extends OrPromise<Result>>(result: R): OrPromise<UnwrapOk<R> | null> {
  return unwrapOr(result, null);
}

/**
 * Unwraps a Result, returning the data for Ok results and undefined for Err results.
 * This is a convenience function that's equivalent to calling `unwrapOr(result, undefined)`.
 *
 * @template R - Type of the Result to unwrap
 * @param result - The Result to unwrap
 * @returns Data from the Ok result or undefined for Err results
 *
 * @example
 * ```typescript
 * unwrapOrUndefined(ok("hello")); // "hello"
 * unwrapOrUndefined(err("error")); // undefined
 * ```
 */
export function unwrapOrUndefined<R extends Result>(result: NonPromise<R>): UnwrapOk<R> | undefined;
export function unwrapOrUndefined<R extends OrPromise<Result>>(result: R): Promise<UnwrapOk<R> | undefined>;
export function unwrapOrUndefined<R extends OrPromise<Result>>(result: R): OrPromise<UnwrapOk<R> | undefined> {
  return unwrapOr(result, undefined);
}

/**
 * Converts a function that returns Results into a function that throws on errors.
 * Useful for integrating Result-based functions with traditional throw-based code.
 *
 * @template R - The Result type returned by the function
 * @template Args - The argument types of the function
 * @param fn - The function that returns Results
 * @returns A new function that throws on Err results and returns data on Ok results
 *
 * @example
 * ```typescript
 * function safeDivide(a: number, b: number) {
 *   return b === 0 ? err("Division by zero") : ok(a / b);
 * }
 *
 * const divide = toThrowable(safeDivide);
 *
 * divide(10, 2); // 5
 * divide(10, 0); // throws "Division by zero"
 * ```
 */
export function toThrowable<R extends Result, Args extends unknown[] = []>(
  fn: (...args: Args) => NonPromise<R>,
): (...args: Args) => UnwrapOk<R>;
export function toThrowable<R extends OrPromise<Result>, Args extends unknown[] = []>(
  fn: (...args: Args) => R,
): (...args: Args) => Promise<UnwrapOk<R>>;
export function toThrowable<R extends OrPromise<Result>, Args extends unknown[] = []>(
  fn: (...args: Args) => R,
): (...args: Args) => OrPromise<UnwrapOk<R>> {
  return (...args: Args) => unwrapOrThrow(fn(...args));
}

/**
 * Converts a function that might throw into a function that returns Results.
 * Useful for wrapping existing throwing functions to work with Result-based error handling.
 *
 * @template FnReturn - The return type of the original function
 * @template CatchReturn - The type returned by the catch handler
 * @template Args - The argument types of the function
 * @param fn - The function that might throw
 * @param onErr - Value or function to handle caught errors
 * @returns A new function that returns Results instead of throwing
 *
 * @example
 * ```typescript
 * const safeParse = fromThrowable(
 *   (input: string) => JSON.parse(input),
 *   (error) => `Parse error: ${error.message}`
 * );
 *
 * safeParse('{"valid": true}'); // Ok<{valid: boolean}>
 * safeParse('invalid json'); // Err<string>
 *
 * const safeDivide = fromThrowable(
 *   (a: number, b: number) => { if (b === 0) throw new Error(); return a / b; },
 *   "Division error"
 * );
 *
 * safeDivide(10, 2); // Ok<number>
 * safeDivide(10, 0); // Err<"Division error">
 * ```
 */
export function fromThrowable<const FnReturn, const CatchReturn, Args extends unknown[] = []>(
  fn: (...args: Args) => NonPromise<FnReturn>,
  onErr: (error: unknown) => NonPromise<CatchReturn>,
): (...args: Args) => Result<FnReturn | UnwrapOk<CatchReturn>, InferValueAsErr<CatchReturn>>;
export function fromThrowable<const FnReturn, const CatchReturn, Args extends unknown[] = []>(
  fn: (...args: Args) => NonPromise<FnReturn>,
  onErr: NonPromise<CatchReturn>,
): (...args: Args) => Result<FnReturn | UnwrapOk<CatchReturn>, InferValueAsErr<CatchReturn>>;
export function fromThrowable<const FnReturn, const CatchReturn, Args extends unknown[] = []>(
  fn: (...args: Args) => OrPromise<FnReturn>,
  onErr: OrFunction<OrPromise<CatchReturn>, [error: unknown]>,
): (...args: Args) => Promise<Result<FnReturn | UnwrapOk<CatchReturn>, InferValueAsErr<CatchReturn>>>;
export function fromThrowable<const FnReturn, const CatchReturn, Args extends unknown[] = []>(
  fn: (...args: Args) => OrPromise<FnReturn>,
  onErr: OrFunction<OrPromise<CatchReturn>, [error: unknown]>,
): (...args: Args) => OrPromise<Result<FnReturn | UnwrapOk<CatchReturn>, InferValueAsErr<CatchReturn>>> {
  return (...args: Args) => tryCatch(() => fn(...args), onErr);
}

/**
 * Executes a function or value safely, catching any errors and returning a Result.
 * Unlike fromThrowable, this executes the operation immediately rather than returning a wrapped function.
 *
 * @template TryReturn - The type returned by the try operation
 * @template CatchReturn - The type returned by the catch handler
 * @param toTry - The function to execute or value to resolve
 * @param toCatch - Value or function to handle caught errors
 * @returns A Result containing either the success value or the catch value
 *
 * @example
 * ```typescript
 * tryCatch(
 *   () => 10 / 0,
 *   (error) => `Parse failed: ${String(error)}`
 * ); // Result<number, `Parse failed: ${string}`>
 *
 * tryCatch(
 *   () => { throw new Error("Something went wrong"); },
 *   "Default error message"
 * ); // Result<never, "Default error message">
 *
 * tryCatch(
 *   () => fetch('/api/data').then(r => r.json()),
 *   (error) => ({ message: "Network error" })
 * ); // Promise<Result<any, { readonly message: "Network error" }>>
 * ```
 */
export function tryCatch<const TryReturn, const CatchReturn>(
  toTry: () => NonPromise<TryReturn>,
  toCatch: (error: unknown) => NonPromise<CatchReturn>,
): Result<TryReturn | UnwrapOk<CatchReturn>, InferValueAsErr<CatchReturn>>;
export function tryCatch<const TryReturn, const CatchReturn>(
  toTry: () => NonPromise<TryReturn>,
  toCatch: NonPromise<CatchReturn>,
): Result<TryReturn | UnwrapOk<CatchReturn>, InferValueAsErr<CatchReturn>>;
export function tryCatch<const TryReturn extends OrPromise<unknown>, const CatchReturn>(
  toTry: OrFunction<TryReturn>,
  toCatch: OrFunction<OrPromise<CatchReturn>, [error: unknown]>,
): Promise<Result<Awaited<TryReturn> | UnwrapOk<CatchReturn>, InferValueAsErr<CatchReturn>>>;
export function tryCatch<const TryReturn, const CatchReturn>(
  toTry: OrFunction<OrPromise<TryReturn>>,
  toCatch: OrFunction<OrPromise<CatchReturn>, [error: unknown]>,
): OrPromise<Result<TryReturn | UnwrapOk<CatchReturn>, InferValueAsErr<CatchReturn>>> {
  const catchFn = (ex: unknown) => mapOrPromise(callOrFunction(toCatch, ex), valueToErr);

  try {
    const result = callOrFunction(toTry);

    return isPromise(result) ? result.then(ok).catch(catchFn) : ok(result);
  } catch (ex) {
    return catchFn(ex);
  }
}

/**
 * Transforms the data of an Ok result using a mapper function.
 * If the result is Err, it passes through unchanged. The mapper can return a value, Result, or Promise.
 *
 * @template R - The input Result type
 * @template MapperReturn - The type returned by the mapper function
 * @param result - The Result to map over
 * @param mapper - Function to transform the Ok data
 * @returns A new Result with transformed data, or the original Err result
 *
 * @example
 * ```typescript
 * mapOk(ok(5), x => x * 2); //  Result<number, never>
 *
 * mapOk(err("error"), x => x * 2); // Result<number, "error">
 *
 * mapOk(ok("123"), str => {
 *   const num = parseInt(str);
 *   return isNaN(num) ? err("Not a number") : ok(num);
 * }); // Result<number, "Not a number">
 * ```
 */
export function mapOk<R extends Result, const MapperReturn>(
  result: NonPromise<R>,
  mapper: (data: UnwrapOk<R>) => NonPromise<MapperReturn>,
): Result<InferValueAsOk<MapperReturn>, UnwrapErr<R | MapperReturn>>;
export function mapOk<R extends Result, const MapperReturn>(
  result: OrPromise<R>,
  mapper: (data: UnwrapOk<R>) => OrPromise<MapperReturn>,
): Promise<Result<InferValueAsOk<MapperReturn>, UnwrapErr<R | MapperReturn>>>;
export function mapOk<R extends Result, const MapperReturn>(
  result: OrPromise<R>,
  mapper: (data: UnwrapOk<R>) => OrPromise<MapperReturn>,
): OrPromise<Result<InferValueAsOk<MapperReturn>, UnwrapErr<R | MapperReturn>>> {
  return match(result, (data) => mapOrPromise(mapper(data), valueToOk), err);
}

/**
 * Transforms the error of an Err result using a mapper function.
 * If the result is Ok, it passes through unchanged. The mapper can return a value, Result, or Promise.
 *
 * @template R - The input Result type
 * @template MapperReturn - The type returned by the mapper function
 * @param result - The Result to map over
 * @param mapper - Function to transform the Err data
 * @returns A new Result with transformed error, or the original Ok result
 *
 * @example
 * ```typescript
 * mapErr(err('Not found'), (msg) => `Error: ${msg}`); // Result<never, "Error: Not found">
 *
 * mapErr(ok(42), (msg) => `Error: ${msg}`); // Result<42, never>
 *
 * mapErr(err(404 as number), code => {
 *   if (code === 404) return ok("Not found, but that's ok");
 *   return err(`HTTP ${code}`);
 * }); // Result<"Not found, but that's ok", `HTTP ${number}`>
 *
 * mapErr(err('network failure'), () => ok('default data')); // Result<"default data", never>
 * ```
 */
export function mapErr<R extends Result, const MapperReturn>(
  result: NonPromise<R>,
  mapper: (data: UnwrapErr<R>) => NonPromise<MapperReturn>,
): Result<UnwrapOk<R | MapperReturn>, InferValueAsErr<MapperReturn>>;
export function mapErr<R extends Result, const MapperReturn>(
  result: OrPromise<R>,
  mapper: (data: UnwrapErr<R>) => OrPromise<MapperReturn>,
): Promise<Result<UnwrapOk<R | MapperReturn>, InferValueAsErr<MapperReturn>>>;
export function mapErr<R extends Result, const MapperReturn>(
  result: OrPromise<R>,
  mapper: (data: UnwrapErr<R>) => OrPromise<MapperReturn>,
): OrPromise<Result<UnwrapOk<R | MapperReturn>, InferValueAsErr<MapperReturn>>> {
  return match(result, ok, (error) => mapOrPromise(mapper(error), valueToErr));
}

/**
 * Pattern matches on a Result, calling the appropriate handler function.
 * Useful for unwrapping a Result taking both success and error cases into account.
 *
 * @template R - The input Result type
 * @template OkReturn - The type returned by the success handler
 * @template ErrReturn - The type returned by the error handler
 * @param result - The Result to match on
 * @param onOk - Function to handle Ok results
 * @param onErr - Function to handle Err results
 * @returns The return value of the called handler function
 *
 * @example
 * ```typescript
 * match(
 *   ok(42),
 *   (data) => `Success: ${data}`,
 *   (error) => `Error: ${error}`
 * ); // "Success: 42"
 *
 * match(
 *   err('error'),
 *   (data) => `Success: ${data}`,
 *   (error) => `Error: ${error}`
 * ); // "Error: error"
 * ```
 */
export function match<R extends Result, const OkReturn, const ErrReturn>(
  result: NonPromise<R>,
  onOk: (data: UnwrapOk<R>) => NonPromise<OkReturn>,
  onErr: (error: UnwrapErr<R>) => NonPromise<ErrReturn>,
): OkReturn | ErrReturn;
export function match<R extends Result, const OkReturn, const ErrReturn>(
  result: NonPromise<R>,
  onOk: (data: UnwrapOk<R>) => NonPromise<OkReturn>,
  onErr: NonPromise<ErrReturn>,
): OkReturn | ErrReturn;
export function match<R extends Result, const OkReturn, const ErrReturn>(
  result: NonPromise<R>,
  onOk: NonPromise<OkReturn>,
  onErr: (error: UnwrapErr<R>) => NonPromise<ErrReturn>,
): OkReturn | ErrReturn;
export function match<R extends Result, const OkReturn, const ErrReturn>(
  result: NonPromise<R>,
  onOk: NonPromise<OkReturn>,
  onErr: NonPromise<ErrReturn>,
): OkReturn | ErrReturn;
export function match<R extends Result, const OkReturn, const ErrReturn>(
  result: OrPromise<R>,
  onOk: (data: UnwrapOk<R>) => OrPromise<OkReturn>,
  onErr: (error: UnwrapErr<R>) => OrPromise<ErrReturn>,
): Promise<OkReturn | ErrReturn>;
export function match<R extends Result, const OkReturn, const ErrReturn>(
  result: OrPromise<R>,
  onOk: (data: UnwrapOk<R>) => OrPromise<OkReturn>,
  onErr: OrPromise<ErrReturn>,
): Promise<OkReturn | ErrReturn>;
export function match<R extends Result, const OkReturn, const ErrReturn>(
  result: OrPromise<R>,
  onOk: OrPromise<OkReturn>,
  onErr: (error: UnwrapErr<R>) => OrPromise<ErrReturn>,
): Promise<OkReturn | ErrReturn>;
export function match<R extends Result, const OkReturn, const ErrReturn>(
  result: OrPromise<R>,
  onOk: OrPromise<OkReturn>,
  onErr: OrPromise<ErrReturn>,
): Promise<OkReturn | ErrReturn>;
export function match<R extends Result, const OkReturn, const ErrReturn>(
  result: OrPromise<R>,
  onOk: (data: UnwrapOk<R>) => OrPromise<OkReturn>,
  onErr: (error: UnwrapErr<R>) => OrPromise<ErrReturn>,
): OrPromise<OkReturn | ErrReturn> {
  if (isPromise(result)) {
    return result.then((r) => match(r, onOk, onErr));
  }

  return isOk(result) ? callOrFunction(onOk, result.data) : callOrFunction(onErr, result.error);
}

/**
 * Transforms the result into a tuple where the first value is data (for successful results)
 * and the second value is error (for error results).
 * Useful when you want to safely unwrap a result without additional unwrapping logic.
 *
 * @template R - The input Result type
 * @param result - The Result to match on
 * @returns A tuple with unwrapped result data and error
 *
 * @example
 * ```typescript
 * function divide(a: number, b: number) {
 *   return b === 0 ? err('division_by_zero') : ok(a / b);
 * }
 *
 * const [data, error] = toTuple(divide(10, 2));
 *
 * if (!error) {
 *   console.log(`Division result is: ${data}`);
 * }
 * ```
 */
export function toTuple<R extends Result>(result: NonPromise<R>): ResultTuple<R>;
export function toTuple<R extends Result>(result: OrPromise<R>): Promise<ResultTuple<R>>;
export function toTuple<R extends Result>(result: OrPromise<R>): OrPromise<ResultTuple<R>> {
  return match(
    result,
    (data) => [data, undefined],
    (error) => [undefined, error],
  );
}

function valueToErr(value: unknown) {
  return isResult(value) ? value : err(value);
}

function valueToOk(value: unknown) {
  return isResult(value) ? value : ok(value);
}
