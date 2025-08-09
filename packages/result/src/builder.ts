import type {
  InferValueAsErr,
  InferValueAsOk,
  IsAsync,
  NonPromise,
  OrFunction,
  OrPromise,
  ResultTuple,
} from './helpers.js';
import { isFunction, isPromise } from './helpers.js';
import type { Result, UnwrapErr, UnwrapOk } from './index.js';
import { mapErr, mapOk, match, toTuple } from './index.js';

/**
 * Creates a fluent Result builder that allows chaining operations.
 * Serves as an alternative API to the functional approach for transforming and handling Results.
 *
 * Automatically handles sync/async contexts and preserves type safety throughout the chain.
 *
 * @template R - The Result type returned by the function or the direct Result type
 * @template A - The argument types of the function (when input is a function)
 *
 * @param fn - A function that returns a synchronous Result
 * @returns A function Result builder for chaining operations on the function's Result
 *
 * @example
 * ```typescript
 * const returningResult = result((ok(1)))
 *   .mapOk(value => value * 2)
 *   .create(); // Ok<2>
 *
 * const returningFunction = result((x: number) => ok(x * 2)) // Ok<number>
 *   .mapOk(value => value * 2)
 *   .create(); // (x: number) => Ok<number>
 *
 * returningFunction(10); // Ok<40>
 * ```
 */
export function result<R extends Result, A extends unknown[] = []>(
  fn: (...args: A) => NonPromise<R>,
): FnResultBuilder<R, A, false>;
export function result<R extends Result>(result: NonPromise<R>): SyncResultBuilder<R>;
export function result<R extends OrPromise<Result>, A extends unknown[] = []>(
  fn: (...args: A) => OrPromise<R>,
): FnResultBuilder<R, A, true>;
export function result<R extends OrPromise<Result>>(result: R): AsyncResultBuilder<Awaited<R>>;
export function result<R extends OrFunction<OrPromise<Result>, A>, A extends unknown[] = []>(result: R): unknown {
  return isFunction(result)
    ? new FnResultBuilder(result)
    : isPromise(result)
      ? new AsyncResultBuilder(result)
      : new SyncResultBuilder(result);
}

class SyncResultBuilder<R extends Result> {
  constructor(private result: NonPromise<R>) {}

  mapOk<const MapperReturn>(
    mapper: (data: UnwrapOk<R>) => NonPromise<MapperReturn>,
  ): SyncResultBuilder<Result<InferValueAsOk<MapperReturn>, UnwrapErr<R | MapperReturn>>>;
  mapOk<const MapperReturn>(
    mapper: (data: UnwrapOk<R>) => OrPromise<MapperReturn>,
  ): AsyncResultBuilder<Result<InferValueAsOk<MapperReturn>, UnwrapErr<R | MapperReturn>>>;
  mapOk<const MapperReturn>(mapper: (data: UnwrapOk<R>) => OrPromise<MapperReturn>): unknown {
    const mapperResult = mapOk(this.result, mapper);

    return isPromise(mapperResult) ? new AsyncResultBuilder(mapperResult) : new SyncResultBuilder(mapperResult);
  }

  mapErr<const MapperReturn>(
    mapper: (data: UnwrapErr<R>) => NonPromise<MapperReturn>,
  ): SyncResultBuilder<Result<UnwrapOk<R | MapperReturn>, InferValueAsErr<MapperReturn>>>;
  mapErr<const MapperReturn>(
    mapper: (data: UnwrapErr<R>) => OrPromise<MapperReturn>,
  ): AsyncResultBuilder<Result<UnwrapOk<R | MapperReturn>, InferValueAsErr<MapperReturn>>>;
  mapErr<const MapperReturn>(mapper: (data: UnwrapErr<R>) => OrPromise<MapperReturn>): unknown {
    const mapperResult = mapErr(this.result, mapper);

    return isPromise(mapperResult) ? new AsyncResultBuilder(mapperResult) : new SyncResultBuilder(mapperResult);
  }

  match<const OkReturn, const ErrReturn>(
    onOk: (data: UnwrapOk<R>) => NonPromise<OkReturn>,
    onErr: (error: UnwrapErr<R>) => NonPromise<ErrReturn>,
  ): OkReturn | ErrReturn;
  match<const OkReturn, const ErrReturn>(
    onOk: (data: UnwrapOk<R>) => NonPromise<OkReturn>,
    onErr: NonPromise<ErrReturn>,
  ): OkReturn | ErrReturn;
  match<const OkReturn, const ErrReturn>(
    onOk: NonPromise<OkReturn>,
    onErr: (error: UnwrapErr<R>) => NonPromise<ErrReturn>,
  ): OkReturn | ErrReturn;
  match<const OkReturn, const ErrReturn>(
    onOk: NonPromise<OkReturn>,
    onErr: NonPromise<ErrReturn>,
  ): OkReturn | ErrReturn;
  match<const OkReturn, const ErrReturn>(
    onOk: (data: UnwrapOk<R>) => OrPromise<OkReturn>,
    onErr: (error: UnwrapErr<R>) => OrPromise<ErrReturn>,
  ): Promise<OkReturn | ErrReturn>;
  match<const OkReturn, const ErrReturn>(
    onOk: (data: UnwrapOk<R>) => OrPromise<OkReturn>,
    onErr: OrPromise<ErrReturn>,
  ): Promise<OkReturn | ErrReturn>;
  match<const OkReturn, const ErrReturn>(
    onOk: OrPromise<OkReturn>,
    onErr: (error: UnwrapErr<R>) => OrPromise<ErrReturn>,
  ): Promise<OkReturn | ErrReturn>;
  match<const OkReturn, const ErrReturn>(
    onOk: OrPromise<OkReturn>,
    onErr: OrPromise<ErrReturn>,
  ): Promise<OkReturn | ErrReturn>;
  match<const OkReturn, const ErrReturn>(
    onOk: (data: UnwrapOk<R>) => OrPromise<OkReturn>,
    onErr: (error: UnwrapErr<R>) => OrPromise<ErrReturn>,
  ): unknown {
    return match(this.result, onOk, onErr);
  }

  toTuple(): ResultTuple<R> {
    return toTuple(this.result);
  }

  create(): R {
    return this.result;
  }
}

class AsyncResultBuilder<R extends Result> {
  constructor(private result: Promise<R>) {}

  mapOk<const MapperReturn>(
    mapper: (data: UnwrapOk<R>) => OrPromise<MapperReturn>,
  ): AsyncResultBuilder<Result<InferValueAsOk<MapperReturn>, UnwrapErr<R | MapperReturn>>> {
    return new AsyncResultBuilder(mapOk(this.result, mapper));
  }

  mapErr<const MapperReturn>(
    mapper: (data: UnwrapErr<R>) => OrPromise<MapperReturn>,
  ): AsyncResultBuilder<Result<UnwrapOk<R | MapperReturn>, InferValueAsErr<MapperReturn>>> {
    return new AsyncResultBuilder(mapErr(this.result, mapper));
  }

  match<const OkReturn, const ErrReturn>(
    onOk: (data: UnwrapOk<R>) => OrPromise<OkReturn>,
    onErr: (error: UnwrapErr<R>) => OrPromise<ErrReturn>,
  ): Promise<OkReturn | ErrReturn>;
  match<const OkReturn, const ErrReturn>(
    onOk: (data: UnwrapOk<R>) => OrPromise<OkReturn>,
    onErr: OrPromise<ErrReturn>,
  ): Promise<OkReturn | ErrReturn>;
  match<const OkReturn, const ErrReturn>(
    onOk: OrPromise<OkReturn>,
    onErr: (error: UnwrapErr<R>) => OrPromise<ErrReturn>,
  ): Promise<OkReturn | ErrReturn>;
  match<const OkReturn, const ErrReturn>(
    onOk: OrPromise<OkReturn>,
    onErr: OrPromise<ErrReturn>,
  ): Promise<OkReturn | ErrReturn>;
  match<const OkReturn, const ErrReturn>(
    onOk: (data: UnwrapOk<R>) => OrPromise<OkReturn>,
    onErr: (error: UnwrapErr<R>) => OrPromise<ErrReturn>,
  ): unknown {
    return match(this.result, onOk, onErr);
  }

  toTuple(): Promise<ResultTuple<R>> {
    return toTuple(this.result);
  }

  create(): Promise<R> {
    return this.result;
  }
}

class FnResultBuilder<R extends OrPromise<Result>, A extends unknown[] = [], Async extends boolean = false> {
  constructor(private fn: (...args: A) => R) {}

  mapOk<const MapperReturn>(
    mapper: (data: UnwrapOk<R>) => NonPromise<MapperReturn>,
  ): FnResultBuilder<
    Result<InferValueAsOk<MapperReturn>, UnwrapErr<R | MapperReturn>>,
    A,
    IsAsync<Async, MapperReturn>
  >;
  mapOk<const MapperReturn>(
    mapper: (data: UnwrapOk<R>) => MapperReturn,
  ): FnResultBuilder<
    Result<InferValueAsOk<MapperReturn>, UnwrapErr<R | MapperReturn>>,
    A,
    IsAsync<Async, MapperReturn>
  >;
  mapOk<const MapperReturn>(mapper: (data: UnwrapOk<R>) => OrPromise<MapperReturn>): unknown {
    return new FnResultBuilder((...args: A) => mapOk(this.fn(...args), mapper));
  }

  mapErr<const MapperReturn>(
    mapper: (data: UnwrapErr<R>) => NonPromise<MapperReturn>,
  ): FnResultBuilder<
    Result<UnwrapOk<R | MapperReturn>, InferValueAsErr<MapperReturn>>,
    A,
    IsAsync<Async, MapperReturn>
  >;
  mapErr<const MapperReturn>(
    mapper: (data: UnwrapErr<R>) => MapperReturn,
  ): FnResultBuilder<
    Result<UnwrapOk<R | MapperReturn>, InferValueAsErr<MapperReturn>>,
    A,
    IsAsync<Async, MapperReturn>
  >;
  mapErr<const MapperReturn>(mapper: (data: UnwrapErr<R>) => OrPromise<MapperReturn>): unknown {
    return new FnResultBuilder((...args: A) => mapErr(this.fn(...args), mapper));
  }

  match<const OkReturn, const ErrReturn>(
    onOk: (data: UnwrapOk<R>) => NonPromise<OkReturn>,
    onErr: (error: UnwrapErr<R>) => NonPromise<ErrReturn>,
  ): FnResult<A, OkReturn | ErrReturn, Async>;
  match<const OkReturn, const ErrReturn>(
    onOk: (data: UnwrapOk<R>) => NonPromise<OkReturn>,
    onErr: NonPromise<ErrReturn>,
  ): FnResult<A, OkReturn | ErrReturn, Async>;
  match<const OkReturn, const ErrReturn>(
    onOk: NonPromise<OkReturn>,
    onErr: (error: UnwrapErr<R>) => NonPromise<ErrReturn>,
  ): FnResult<A, OkReturn | ErrReturn, Async>;
  match<const OkReturn, const ErrReturn>(
    onOk: NonPromise<OkReturn>,
    onErr: NonPromise<ErrReturn>,
  ): FnResult<A, OkReturn | ErrReturn, Async>;
  match<const OkReturn, const ErrReturn>(
    onOk: (data: UnwrapOk<R>) => OrPromise<OkReturn>,
    onErr: (error: UnwrapErr<R>) => OrPromise<ErrReturn>,
  ): (...args: A) => Promise<OkReturn | ErrReturn>;
  match<const OkReturn, const ErrReturn>(
    onOk: (data: UnwrapOk<R>) => OrPromise<OkReturn>,
    onErr: OrPromise<ErrReturn>,
  ): (...args: A) => Promise<OkReturn | ErrReturn>;
  match<const OkReturn, const ErrReturn>(
    onOk: OrPromise<OkReturn>,
    onErr: (error: UnwrapErr<R>) => OrPromise<ErrReturn>,
  ): (...args: A) => Promise<OkReturn | ErrReturn>;
  match<const OkReturn, const ErrReturn>(
    onOk: OrPromise<OkReturn>,
    onErr: OrPromise<ErrReturn>,
  ): (...args: A) => Promise<OkReturn | ErrReturn>;
  match<const OkReturn, const ErrReturn>(
    onOk: (data: UnwrapOk<R>) => OrPromise<OkReturn>,
    onErr: (error: UnwrapErr<R>) => OrPromise<ErrReturn>,
  ): unknown {
    return (...args: A) => match(this.fn(...args), onOk, onErr);
  }

  toTuple() {
    return ((...args: A) => toTuple(this.fn(...args))) as FnResult<A, ResultTuple<Awaited<R>>, Async>;
  }

  create() {
    return this.fn as FnResult<A, R, Async>;
  }
}

type FnResult<A extends unknown[], R, Async extends boolean> = (
  ...args: A
) => Async extends true ? Promise<Awaited<R>> : Awaited<R>;
