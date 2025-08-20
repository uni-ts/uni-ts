import type { Err, FlattenErr, FlattenOk, Ok, Result, UnwrapErr, UnwrapOk } from './index.js';

export type Fn<A extends any[] = any[], R = any> = (...args: A) => R;

export type Returned<T> = T extends Fn ? ReturnType<T> : T;

export type OrPromise<T> = T | Promise<T>;

export type OrFunction<T, A extends any[] = []> = T | ((...args: A) => T);

export type NonPromise<T> = T extends Fn
  ? ReturnType<T> extends Promise<unknown>
    ? never
    : T
  : T extends Promise<unknown>
    ? never
    : T;

export type InferValueAsOk<T> = FlattenOk<Exclude<Awaited<Returned<T>>, Err>>;

export type InferValueAsErr<T> = FlattenErr<Exclude<Awaited<Returned<T>>, Ok>>;

export type ResultTuple<R extends Result> = Readonly<
  [ok: UnwrapOk<R>, err: undefined] | [ok: undefined, err: UnwrapErr<R>]
>;

export type IsAsync<Current extends boolean, Return> = [Return] extends [never]
  ? false
  : Current extends true
    ? true
    : Return extends Promise<unknown>
      ? true
      : false;

export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return value instanceof Promise;
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function mapOrPromise<T, R>(orPromise: OrPromise<T>, fn: (value: T) => R): OrPromise<R> {
  return isPromise(orPromise) ? orPromise.then(fn) : fn(orPromise);
}

export function callOrFunction<T, A extends unknown[] = []>(orFn: OrFunction<T, A>, ...args: A): T {
  return isFunction(orFn) ? orFn(...args) : orFn;
}

export function first<const T extends unknown[]>(...args: T): T[number] {
  return args[0];
}
