import { describe, expect, expectTypeOf, it } from 'vitest';
import { first } from './helpers.js';
import type {
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
import {
  err,
  fromThrowable,
  isErr,
  isErrResult,
  isOk,
  isOkResult,
  isResult,
  mapErr,
  mapOk,
  match,
  ok,
  toThrowable,
  tryCatch,
  unwrapOr,
  unwrapOrNull,
  unwrapOrThrow,
  unwrapOrUndefined,
} from './index.js';

const mixedTypes = {
  sync: [ok('data'), ok({ foo: 'bar' }), err('404'), err({ code: 404 })],
  async: [
    Promise.resolve(ok('data')),
    Promise.resolve(ok({ foo: 'bar' })),
    Promise.resolve(err('404')),
    Promise.resolve(err({ code: 404 })),
  ],
  mixed: [Promise.resolve(ok('data')), ok({ foo: 'bar' }), err('404'), Promise.resolve(err({ code: 404 }))],
};

type MixedOk = 'data' | { readonly foo: 'bar' };

describe('index.ts', () => {
  describe('Basic interfaces', () => {
    it('Ok', () => {
      expectTypeOf<Ok<string>>().toEqualTypeOf<{
        success: true;
        data: string;
      }>();
      expectTypeOf<Ok<number>>().toEqualTypeOf<{
        success: true;
        data: number;
      }>();
      expectTypeOf<Ok<{ foo: string }>>().toEqualTypeOf<{
        success: true;
        data: { foo: string };
      }>();
      expectTypeOf<Ok>().toEqualTypeOf<{ success: true; data: any }>();
    });

    it('Err', () => {
      expectTypeOf<Err<string>>().toEqualTypeOf<{
        success: false;
        error: string;
      }>();
      expectTypeOf<Err<Error>>().toEqualTypeOf<{
        success: false;
        error: Error;
      }>();
      expectTypeOf<Err<{ code: number }>>().toEqualTypeOf<{
        success: false;
        error: { code: number };
      }>();
      expectTypeOf<Err>().toEqualTypeOf<{ success: false; error: any }>();
    });

    it('Result', () => {
      expectTypeOf<Result<string, Error>>().toEqualTypeOf<Ok<string> | Err<Error>>();
      expectTypeOf<Result<number, string>>().toEqualTypeOf<Ok<number> | Err<string>>();
      expectTypeOf<Result>().toEqualTypeOf<Ok<any> | Err<any>>();
    });

    it('UnknownResult', () => {
      expectTypeOf<UnknownResult>().toEqualTypeOf<Result<unknown, unknown>>();
      expectTypeOf<UnknownResult>().toEqualTypeOf<Ok<unknown> | Err<unknown>>();
    });
  });

  describe('ExtractOk', () => {
    it('extracts Ok types from unions', () => {
      type Mixed = Ok<string> | Err<number> | Ok<boolean>;
      expectTypeOf<ExtractOk<Mixed>>().toEqualTypeOf<Ok<string> | Ok<boolean>>();

      type SingleOk = Ok<string>;
      expectTypeOf<ExtractOk<SingleOk>>().toEqualTypeOf<Ok<string>>();

      type NoOk = Err<string> | Err<number>;
      expectTypeOf<ExtractOk<NoOk>>().toEqualTypeOf<never>();

      type ComplexUnion = Ok<{ data: string }> | Err<{ code: number }> | string | Ok<number[]>;
      expectTypeOf<ExtractOk<ComplexUnion>>().toEqualTypeOf<Ok<{ data: string }> | Ok<number[]>>();
    });
  });

  describe('ExtractErr', () => {
    it('extracts Err types from unions', () => {
      type Mixed = Ok<string> | Err<number> | Err<boolean>;
      expectTypeOf<ExtractErr<Mixed>>().toEqualTypeOf<Err<number> | Err<boolean>>();

      type SingleErr = Err<string>;
      expectTypeOf<ExtractErr<SingleErr>>().toEqualTypeOf<Err<string>>();

      type NoErr = Ok<string> | Ok<number>;
      expectTypeOf<ExtractErr<NoErr>>().toEqualTypeOf<never>();

      type ComplexUnion = Ok<{ data: string }> | Err<{ code: number }> | string | Err<Error>;
      expectTypeOf<ExtractErr<ComplexUnion>>().toEqualTypeOf<Err<{ code: number }> | Err<Error>>();
    });
  });

  describe('InferOk', () => {
    it('infers Ok types from simple Results', () => {
      type SimpleResult = Result<string, Error>;
      expectTypeOf<InferOk<SimpleResult>>().toEqualTypeOf<Ok<string>>();
    });

    it('infers Ok types from Promise Results', () => {
      type AsyncResult = Promise<Result<{ data: string }, { error: string }>>;
      expectTypeOf<InferOk<AsyncResult>>().toEqualTypeOf<Ok<{ data: string }>>();
    });

    it('infers Ok types from function return types', () => {
      type SyncFn = () => Result<number, string>;
      expectTypeOf<InferOk<SyncFn>>().toEqualTypeOf<Ok<number>>();

      type AsyncFn = () => Promise<Result<boolean, Error>>;
      expectTypeOf<InferOk<AsyncFn>>().toEqualTypeOf<Ok<boolean>>();
    });

    it('handles complex scenarios', () => {
      type ComplexFn = () => Promise<Ok<string>> | Err<number> | Ok<boolean> | [];
      expectTypeOf<InferOk<ComplexFn>>().toEqualTypeOf<Ok<string> | Ok<boolean>>();
    });
  });

  describe('InferErr', () => {
    it('infers Err types from simple Results', () => {
      type SimpleResult = Result<string, Error>;
      expectTypeOf<InferErr<SimpleResult>>().toEqualTypeOf<Err<Error>>();
    });

    it('infers Err types from function return types', () => {
      type SyncFn = () => Result<number, string>;
      expectTypeOf<InferErr<SyncFn>>().toEqualTypeOf<Err<string>>();

      type AsyncFn = () => Promise<Result<boolean, Error>>;
      expectTypeOf<InferErr<AsyncFn>>().toEqualTypeOf<Err<Error>>();
    });

    it('infers Err types from Promise Results', () => {
      type AsyncResult = Promise<Result<{ data: string }, { error: string }>>;
      expectTypeOf<InferErr<AsyncResult>>().toEqualTypeOf<Err<{ error: string }>>();
    });

    it('handles complex scenarios', () => {
      type ComplexFn = () => Promise<Ok<string>> | Err<number> | Err<boolean> | [];
      expectTypeOf<InferErr<ComplexFn>>().toEqualTypeOf<Err<number> | Err<boolean>>();
    });
  });

  describe('UnwrapOk', () => {
    it('unwraps data from Ok types', () => {
      type StringResult = Result<string, Error>;
      expectTypeOf<UnwrapOk<StringResult>>().toEqualTypeOf<string>();

      type NumberResult = Result<number, string>;
      expectTypeOf<UnwrapOk<NumberResult>>().toEqualTypeOf<number>();

      type ObjectResult = Result<{ data: string }, Error>;
      expectTypeOf<UnwrapOk<ObjectResult>>().toEqualTypeOf<{ data: string }>();
    });

    it('handles union types', () => {
      type MultiResult = Result<string, Error> | Result<number, string>;
      expectTypeOf<UnwrapOk<MultiResult>>().toEqualTypeOf<string | number>();
    });

    it('handles async types', () => {
      type AsyncResult = Promise<Result<boolean, Error>>;
      expectTypeOf<UnwrapOk<AsyncResult>>().toEqualTypeOf<boolean>();

      type AsyncFn = () => Promise<Result<{ value: number }, string>>;
      expectTypeOf<UnwrapOk<AsyncFn>>().toEqualTypeOf<{ value: number }>();
    });

    it('returns never for pure Err types', () => {
      type ErrOnly = Err<string>;
      expectTypeOf<UnwrapOk<ErrOnly>>().toEqualTypeOf<never>();
    });
  });

  describe('UnwrapErr', () => {
    it('unwraps error from Err types', () => {
      type StringResult = Result<string, Error>;
      expectTypeOf<UnwrapErr<StringResult>>().toEqualTypeOf<Error>();

      type NumberResult = Result<string, number>;
      expectTypeOf<UnwrapErr<NumberResult>>().toEqualTypeOf<number>();

      type ObjectResult = Result<string, { code: number }>;
      expectTypeOf<UnwrapErr<ObjectResult>>().toEqualTypeOf<{ code: number }>();
    });

    it('handles union types', () => {
      type MultiResult = Result<string, Error> | Result<string, { code: number }>;
      expectTypeOf<UnwrapErr<MultiResult>>().toEqualTypeOf<Error | { code: number }>();
    });

    it('handles async types', () => {
      type AsyncResult = Promise<Result<string, boolean>>;
      expectTypeOf<UnwrapErr<AsyncResult>>().toEqualTypeOf<boolean>();

      type AsyncFn = () => Promise<Result<string, { message: string }>>;
      expectTypeOf<UnwrapErr<AsyncFn>>().toEqualTypeOf<{ message: string }>();
    });

    it('returns never for pure Ok types', () => {
      type OkOnly = Ok<string>;
      expectTypeOf<UnwrapErr<OkOnly>>().toEqualTypeOf<never>();
    });
  });

  describe('FlattenOk', () => {
    it('flattens Ok types', () => {
      expectTypeOf<FlattenOk<Ok<string>>>().toEqualTypeOf<string>();
      expectTypeOf<FlattenOk<Ok<{ data: number }>>>().toEqualTypeOf<{
        data: number;
      }>();
    });

    it('leaves non-Ok types unchanged', () => {
      expectTypeOf<FlattenOk<string>>().toEqualTypeOf<string>();
      expectTypeOf<FlattenOk<Err<Error>>>().toEqualTypeOf<Err<Error>>();
    });

    it('handles union types', () => {
      type Mixed = Ok<string> | number | Err<Error>;
      expectTypeOf<FlattenOk<Mixed>>().toEqualTypeOf<string | number | Err<Error>>();
    });
  });

  describe('FlattenErr', () => {
    it('flattens Err types', () => {
      expectTypeOf<FlattenErr<Err<string>>>().toEqualTypeOf<string>();
      expectTypeOf<FlattenErr<Err<{ code: number }>>>().toEqualTypeOf<{
        code: number;
      }>();
    });

    it('leaves non-Err types unchanged', () => {
      expectTypeOf<FlattenErr<string>>().toEqualTypeOf<string>();
      expectTypeOf<FlattenErr<Ok<string>>>().toEqualTypeOf<Ok<string>>();
    });

    it('handles union types', () => {
      type Mixed = Err<string> | number | Ok<boolean>;
      expectTypeOf<FlattenErr<Mixed>>().toEqualTypeOf<string | number | Ok<boolean>>();
    });
  });

  describe('ok', () => {
    it('creates an Ok result', () => {
      const result = ok('data');

      expect(result).toEqual({ success: true, data: 'data' });
      expectTypeOf(result).toEqualTypeOf<Ok<'data'>>();
    });

    it('creates immutable types', () => {
      expectTypeOf(ok('data')).toEqualTypeOf<Ok<'data'>>();
      expectTypeOf(ok(42)).toEqualTypeOf<Ok<42>>();
      expectTypeOf(ok(true)).toEqualTypeOf<Ok<true>>();
      expectTypeOf(ok({ foo: 'bar' })).toEqualTypeOf<Ok<{ readonly foo: 'bar' }>>();
      expectTypeOf(ok([1, 2, 3])).toEqualTypeOf<Ok<readonly [1, 2, 3]>>();
    });

    it('works with different data types', () => {
      const numberOk = ok(42);

      expect(numberOk).toEqual({ success: true, data: 42 });
      expectTypeOf(numberOk).toEqualTypeOf<Ok<42>>();

      const objectOk = ok({ foo: 'bar' });

      expect(objectOk).toEqual({ success: true, data: { foo: 'bar' } });
      expectTypeOf(objectOk).toEqualTypeOf<Ok<{ readonly foo: 'bar' }>>();

      const arrayOk = ok([1, 2, 3]);

      expect(arrayOk).toEqual({ success: true, data: [1, 2, 3] });
      expectTypeOf(arrayOk).toEqualTypeOf<Ok<readonly [1, 2, 3]>>();
    });
  });

  describe('err', () => {
    it('creates an Err result', () => {
      const result = err('some error');

      expect(result).toEqual({ success: false, error: 'some error' });
      expectTypeOf(result).toEqualTypeOf<Err<'some error'>>();
    });

    it('creates immutable types', () => {
      expectTypeOf(err('data')).toEqualTypeOf<Err<'data'>>();
      expectTypeOf(err(42)).toEqualTypeOf<Err<42>>();
      expectTypeOf(err(true)).toEqualTypeOf<Err<true>>();
      expectTypeOf(err({ foo: 'bar' })).toEqualTypeOf<Err<{ readonly foo: 'bar' }>>();
      expectTypeOf(err([1, 2, 3])).toEqualTypeOf<Err<readonly [1, 2, 3]>>();
    });

    it('works with different error types', () => {
      const error = new Error('test error');
      const errorResult = err(error);

      expect(errorResult).toEqual({ success: false, error });
      expectTypeOf(errorResult).toEqualTypeOf<Err<Error>>();

      const objectResult = err({ code: 404 });

      expect(objectResult).toEqual({ success: false, error: { code: 404 } });
      expectTypeOf(objectResult).toEqualTypeOf<Err<{ readonly code: 404 }>>();
    });
  });

  describe('isResult', () => {
    it('returns true for Ok results', () => {
      expect(isResult(ok('data'))).toBe(true);
    });

    it('returns true for Err results', () => {
      expect(isResult(err('error'))).toBe(true);
    });

    it('returns false for wrong data types', () => {
      expect(isResult('test')).toBe(false);
      expect(isResult(42)).toBe(false);
      expect(isResult(true)).toBe(false);
      expect(isResult({})).toBe(false);
      expect(isResult([])).toBe(false);
      expect(isResult(null)).toBe(false);
    });

    describe('returns false for objects with wrong shape', () => {
      it('missing properties', () => {
        expect(isResult({ success: true })).toBe(false);
      });

      it('extra properties', () => {
        expect(isResult({ success: true, data: 'data', extra: 'extra' })).toBe(false);
      });

      it('wrong properties', () => {
        expect(isResult({ success: true, error: 'error' })).toBe(false);
        expect(isResult({ success: false, data: 'data' })).toBe(false);
      });
    });

    it('casts value to Result type', () => {
      expectTypeOf(isResult).guards.toExtend<Result>();
      const value = first(ok(42), err('error'), 'test');

      if (isResult(value)) {
        expectTypeOf(value).toEqualTypeOf<Result<42, 'error'>>();
      } else {
        expectTypeOf(value).toEqualTypeOf<string>();
      }
    });
  });

  describe('isOk', () => {
    it('returns true for Ok results', () => {
      const result = ok('data');

      expect(isOk(result)).toBe(true);

      if (isOk(result)) {
        expectTypeOf(result).toEqualTypeOf<Ok<'data'>>();
      }
    });

    it('returns false for Err results', () => {
      const result = err('error');

      expect(isOk(result)).toBe(false);

      if (!isOk(result)) {
        expectTypeOf(result).toEqualTypeOf<Err<'error'>>();
      }
    });

    it('only accepts Result type as argument', () => {
      // @ts-expect-error - value is not of a Result type
      expect(isOk({})).toBe(false);
    });
  });

  describe('isOkResult', () => {
    it('returns true for Ok results', () => {
      const result = ok('data');

      expect(isOkResult(result)).toBe(true);
    });

    it('returns false for Err results', () => {
      const result = err('error');

      expect(isOkResult(result)).toBe(false);
    });

    it('accepts any type as argument', () => {
      expect(isOkResult({ success: true })).toBe(false);
    });

    it('returns false for wrong data types', () => {
      expect(isOkResult('test')).toBe(false);
      expect(isOkResult(42)).toBe(false);
      expect(isOkResult(true)).toBe(false);
      expect(isOkResult({})).toBe(false);
      expect(isOkResult([])).toBe(false);
    });
  });

  describe('isErr', () => {
    it('returns true for Err results', () => {
      const result = err('error');

      expect(isErr(result)).toBe(true);
    });

    it('returns false for Ok results', () => {
      const result = ok('data');

      expect(isErr(result)).toBe(false);
    });

    it('only accepts Result type as argument', () => {
      // @ts-expect-error - value is not of a Result type
      expect(isErr({})).toBe(false);
    });
  });

  describe('isErrResult', () => {
    it('returns true for Err results', () => {
      const result = err('error');

      expect(isErrResult(result)).toBe(true);
    });

    it('returns false for Ok results', () => {
      const result = ok('data');

      expect(isErrResult(result)).toBe(false);
    });

    it('accepts any type as argument', () => {
      expect(isErrResult({ success: false })).toBe(false);
    });

    it('returns false for wrong data types', () => {
      expect(isErrResult('test')).toBe(false);
      expect(isErrResult(42)).toBe(false);
      expect(isErrResult(true)).toBe(false);
      expect(isErrResult({})).toBe(false);
      expect(isErrResult([])).toBe(false);
    });
  });

  describe('unwrapOr', () => {
    it('returns the data for Ok results', () => {
      const value = unwrapOr(ok('data'), 'error_happened');

      expect(value).toBe('data');
      expectTypeOf(value).toEqualTypeOf<'data' | 'error_happened'>();
    });

    it('returns the provided value for Err results', () => {
      const value = unwrapOr(err('error'), 'error_happened');

      expect(value).toBe('error_happened');
      expectTypeOf(value).toEqualTypeOf<'error_happened'>();
    });

    it('works with promises', async () => {
      const okValue = unwrapOr(Promise.resolve(ok('data')), 'error_happened');

      expect(await okValue).toBe('data');
      expectTypeOf(okValue).toEqualTypeOf<Promise<'data' | 'error_happened'>>();

      const errValue = unwrapOr(Promise.resolve(err('error')), 'error_happened');

      expect(await errValue).toBe('error_happened');
      expectTypeOf(errValue).toEqualTypeOf<Promise<'error_happened'>>();
    });

    describe('works with multiple return types', () => {
      it('sync', () => {
        const value = unwrapOr(first(...mixedTypes.sync), 'error_happened');

        expect(value).toBe('data');
        expectTypeOf(value).toEqualTypeOf<MixedOk | 'error_happened'>();
      });

      it('async', async () => {
        const value = unwrapOr(Promise.resolve(first(...mixedTypes.async)), 'error_happened');

        expect(await value).toBe('data');
        expectTypeOf(value).toEqualTypeOf<Promise<MixedOk | 'error_happened'>>();
      });

      it('mixed', async () => {
        const value = unwrapOr(first(...mixedTypes.mixed), 'error_happened');

        expect(await value).toBe('data');
        expectTypeOf(value).toEqualTypeOf<Promise<MixedOk | 'error_happened'>>();
      });
    });

    it('takes a function to determine the value for Err results', () => {
      const value = unwrapOr(first(err('error'), err('error2')), (error) => error);

      expect(value).toBe('error');
      expectTypeOf(value).toEqualTypeOf<'error' | 'error2'>();
    });

    it('takes async function to determine the value for Err results', async () => {
      const value1 = unwrapOr(err('error'), async () => 'error_happened' as const);
      expect(await value1).toBe('error_happened');
      expectTypeOf(value1).toEqualTypeOf<Promise<'error_happened'>>();

      const value2 = unwrapOr(ok('success'), async () => 'error_happened' as const);
      expect(await value2).toBe('success');
      expectTypeOf(value2).toEqualTypeOf<Promise<'success' | 'error_happened'>>();
    });

    it('works with static values for Err results', () => {
      const value1 = unwrapOr(err('error'), 'error_happened');
      expect(value1).toBe('error_happened');
      expectTypeOf(value1).toEqualTypeOf<'error_happened'>();

      const value2 = unwrapOr(ok('success'), 'error_happened');
      expect(value2).toBe('success');
      expectTypeOf(value2).toEqualTypeOf<'success' | 'error_happened'>();
    });

    it('works with promises for Err results', async () => {
      const value1 = unwrapOr(err('error'), Promise.resolve('error_happened' as const));
      expect(await value1).toBe('error_happened');
      expectTypeOf(value1).toEqualTypeOf<Promise<'error_happened'>>();

      const value2 = unwrapOr(ok('success'), Promise.resolve('error_happened' as const));
      expect(await value2).toBe('success');
      expectTypeOf(value2).toEqualTypeOf<Promise<'success' | 'error_happened'>>();
    });

    it('handles complex default value types', () => {
      const value = unwrapOr(err('network error'), {
        fallback: true,
        code: 500,
      });

      expect(value).toEqual({ fallback: true, code: 500 });
      expectTypeOf(value).toEqualTypeOf<{
        readonly fallback: true;
        readonly code: 500;
      }>();
    });

    it('preserves error type in function parameters', () => {
      const value = unwrapOr(err({ code: 404, message: 'Not found' }), (error) => {
        expectTypeOf(error).toEqualTypeOf<Readonly<{ code: 404; message: 'Not found' }>>();
        return `Error ${error.code}: ${error.message}`;
      });

      expect(value).toBe('Error 404: Not found');
      expectTypeOf(value).toEqualTypeOf<'Error 404: Not found'>();
    });
  });

  describe('unwrapOrThrow', () => {
    it('returns the data for Ok results', () => {
      const result = ok('data');

      expect(unwrapOrThrow(result)).toBe('data');
      expectTypeOf(unwrapOrThrow(result)).toEqualTypeOf<'data'>();
    });

    it('throws an error for Err results', () => {
      const result = err('error');

      expect(() => unwrapOrThrow(result)).toThrow('error');
      expectTypeOf(() => unwrapOrThrow(result)).returns.toEqualTypeOf<never>();
    });

    it('works with fulfilled promises', async () => {
      const result1 = Promise.resolve(ok('data'));

      expect(await unwrapOrThrow(result1)).toBe('data');
      expectTypeOf(unwrapOrThrow(result1)).toEqualTypeOf<Promise<'data'>>();

      const result2 = Promise.resolve(err('error'));

      await expect(unwrapOrThrow(result2)).rejects.toThrow('error');
      expectTypeOf(() => unwrapOrThrow(result2)).returns.toEqualTypeOf<Promise<never>>();
    });

    it('works with rejected promises', async () => {
      const result1 = Promise.reject(ok('data'));

      expect(await unwrapOrThrow(result1).catch((e) => e)).toStrictEqual(ok('data'));
      expectTypeOf(() => unwrapOrThrow(result1)).returns.toEqualTypeOf<Promise<never>>();

      const result2 = Promise.reject(err('error'));

      expect(await unwrapOrThrow(result2).catch((e) => e)).toStrictEqual(err('error'));
      expectTypeOf(() => unwrapOrThrow(result2)).returns.toEqualTypeOf<Promise<never>>();
    });

    describe('works with multiple return types', () => {
      it('sync', () => {
        const result = first(...mixedTypes.sync);

        expect(unwrapOrThrow(result)).toBe('data');
        expectTypeOf(unwrapOrThrow(result)).toEqualTypeOf<MixedOk>();
      });

      it('async', async () => {
        const result = first(...mixedTypes.async);

        expect(await unwrapOrThrow(result)).toBe('data');
        expectTypeOf(unwrapOrThrow(result)).toEqualTypeOf<Promise<MixedOk>>();
      });

      it('mixed', async () => {
        const result = first(...mixedTypes.mixed);

        expect(await unwrapOrThrow(result)).toBe('data');
        expectTypeOf(unwrapOrThrow(result)).toEqualTypeOf<Promise<MixedOk>>();
      });
    });
  });

  describe('unwrapOrNull', () => {
    it('returns the data for Ok results', () => {
      const value = unwrapOrNull(ok('data'));

      expect(value).toBe('data');
      expectTypeOf(value).toEqualTypeOf<'data' | null>();
    });

    it('returns null for Err results', () => {
      const value = unwrapOrNull(err('error'));

      expect(value).toBe(null);
      expectTypeOf(value).toEqualTypeOf<null>();
    });

    it('works with promises', async () => {
      const okValue = unwrapOrNull(Promise.resolve(ok('data')));

      expect(await okValue).toBe('data');
      expectTypeOf(okValue).toEqualTypeOf<Promise<'data' | null>>();

      const errValue = unwrapOrNull(Promise.resolve(err('error')));

      expect(await errValue).toBe(null);
      expectTypeOf(errValue).toEqualTypeOf<Promise<null>>();
    });

    describe('works with multiple return types', () => {
      it('sync', () => {
        const value = unwrapOrNull(first(...mixedTypes.sync));

        expect(value).toBe('data');
        expectTypeOf(value).toEqualTypeOf<MixedOk | null>();
      });

      it('async', async () => {
        const value = unwrapOrNull(Promise.resolve(first(...mixedTypes.async)));

        expect(await value).toBe('data');
        expectTypeOf(value).toEqualTypeOf<Promise<MixedOk | null>>();
      });

      it('mixed', async () => {
        const value = unwrapOrNull(first(...mixedTypes.mixed));

        expect(await value).toBe('data');
        expectTypeOf(value).toEqualTypeOf<Promise<MixedOk | null>>();
      });
    });

    it('handles complex data types', () => {
      const objectResult = unwrapOrNull(ok({ name: 'test', age: 25 }));
      expect(objectResult).toEqual({ name: 'test', age: 25 });
      expectTypeOf(objectResult).toEqualTypeOf<{
        readonly name: 'test';
        readonly age: 25;
      } | null>();

      const arrayResult = unwrapOrNull(ok([1, 2, 3]));
      expect(arrayResult).toEqual([1, 2, 3]);
      expectTypeOf(arrayResult).toEqualTypeOf<readonly [1, 2, 3] | null>();
    });

    it('preserves null distinction from undefined', () => {
      const nullOk = unwrapOrNull(ok(null));
      expect(nullOk).toBe(null);
      expectTypeOf(nullOk).toEqualTypeOf<null>();

      const undefinedOk = unwrapOrNull(ok(undefined));
      expect(undefinedOk).toBe(undefined);
      expectTypeOf(undefinedOk).toEqualTypeOf<undefined | null>();
    });
  });

  describe('unwrapOrUndefined', () => {
    it('returns the data for Ok results', () => {
      const value = unwrapOrUndefined(ok('data'));

      expect(value).toBe('data');
      expectTypeOf(value).toEqualTypeOf<'data' | undefined>();
    });

    it('returns undefined for Err results', () => {
      const value = unwrapOrUndefined(err('error'));

      expect(value).toBe(undefined);
      expectTypeOf(value).toEqualTypeOf<undefined>();
    });

    it('works with promises', async () => {
      const okValue = unwrapOrUndefined(Promise.resolve(ok('data')));

      expect(await okValue).toBe('data');
      expectTypeOf(okValue).toEqualTypeOf<Promise<'data' | undefined>>();

      const errValue = unwrapOrUndefined(Promise.resolve(err('error')));

      expect(await errValue).toBe(undefined);
      expectTypeOf(errValue).toEqualTypeOf<Promise<undefined>>();
    });

    describe('works with multiple return types', () => {
      it('sync', () => {
        const value = unwrapOrUndefined(first(...mixedTypes.sync));

        expect(value).toBe('data');
        expectTypeOf(value).toEqualTypeOf<MixedOk | undefined>();
      });

      it('async', async () => {
        const value = unwrapOrUndefined(Promise.resolve(first(...mixedTypes.async)));

        expect(await value).toBe('data');
        expectTypeOf(value).toEqualTypeOf<Promise<MixedOk | undefined>>();
      });

      it('mixed', async () => {
        const value = unwrapOrUndefined(first(...mixedTypes.mixed));

        expect(await value).toBe('data');
        expectTypeOf(value).toEqualTypeOf<Promise<MixedOk | undefined>>();
      });
    });

    it('handles complex data types', () => {
      const objectResult = unwrapOrUndefined(ok({ name: 'test', active: true }));
      expect(objectResult).toEqual({ name: 'test', active: true });
      expectTypeOf(objectResult).toEqualTypeOf<{ readonly name: 'test'; readonly active: true } | undefined>();

      const arrayResult = unwrapOrUndefined(ok(['a', 'b', 'c']));
      expect(arrayResult).toEqual(['a', 'b', 'c']);
      expectTypeOf(arrayResult).toEqualTypeOf<readonly ['a', 'b', 'c'] | undefined>();
    });

    it('preserves undefined distinction from null', () => {
      const undefinedOk = unwrapOrUndefined(ok(undefined));
      expect(undefinedOk).toBe(undefined);
      expectTypeOf(undefinedOk).toEqualTypeOf<undefined>();

      const nullOk = unwrapOrUndefined(ok(null));
      expect(nullOk).toBe(null);
      expectTypeOf(nullOk).toEqualTypeOf<null | undefined>();
    });
  });

  describe('toThrowable', () => {
    it('converts a result-returning function to a throwable one', () => {
      const fn1 = toThrowable(() => first(ok('data'), err('404')));

      expect(fn1()).toBe('data');
      expectTypeOf(fn1()).toEqualTypeOf<'data'>();

      const fn2 = toThrowable(() => first(err('404'), ok('data')));

      expect(() => fn2()).toThrow('404');
      expectTypeOf(fn2).returns.toEqualTypeOf<'data'>();
    });

    describe('works with multiple return types', () => {
      it('sync', () => {
        const fn = toThrowable(() => first(...mixedTypes.sync));

        expect(fn()).toBe('data');
        expectTypeOf(fn()).toEqualTypeOf<MixedOk>();
      });

      it('async', async () => {
        const fn = toThrowable(() => Promise.resolve(first(...mixedTypes.async)));

        expect(await fn()).toBe('data');
        expectTypeOf(fn()).toEqualTypeOf<Promise<MixedOk>>();
      });

      it('mixed', async () => {
        const fn = toThrowable(() => first(...mixedTypes.mixed));

        expect(await fn()).toBe('data');
        expectTypeOf(fn()).toEqualTypeOf<Promise<MixedOk>>();
      });
    });
  });

  describe('fromThrowable', () => {
    describe('sync', () => {
      describe('fn', () => {
        it('handles successful functions', () => {
          const fn = fromThrowable(() => 42, 'error');

          expect(fn()).toEqual(ok(42));
          expectTypeOf(fn).toEqualTypeOf<() => Result<number, 'error'>>();
        });

        it('handles throwing functions', () => {
          const fn = fromThrowable(() => {
            throw new Error('test error');
            // biome-ignore lint/correctness/noUnreachable: needed for type inference
            return 42;
          }, 'caught error');

          expect(fn()).toEqual(err('caught error'));
          expectTypeOf(fn).toEqualTypeOf<() => Result<number, 'caught error'>>();
        });

        it('infers function parameters', () => {
          const fn = fromThrowable((a: number, b: number) => a / b, 'error');

          expect(fn(1, 2)).toEqual(ok(0.5));
          expectTypeOf(fn).toEqualTypeOf<(a: number, b: number) => Result<number, 'error'>>();
        });
      });

      describe('catch', () => {
        const throwable = () => {
          throw new Error('throwable error');
        };

        it('can be a value', async () => {
          const fn = fromThrowable(throwable, 'error');

          expect(fn()).toEqual(err('error'));
          expectTypeOf(fn).toEqualTypeOf<() => Result<never, 'error'>>();
        });

        it('can be a function', async () => {
          const fn = fromThrowable(throwable, () => 'error' as const);

          expect(fn()).toEqual(err('error'));
          expectTypeOf(fn).toEqualTypeOf<() => Result<never, 'error'>>();
        });

        it('can be a promise', async () => {
          const fn = fromThrowable(throwable, Promise.resolve('error' as const));

          expect(await fn()).toEqual(err('error'));
          expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<never, 'error'>>>();
        });

        it('can be an async function', async () => {
          const fn = fromThrowable(throwable, () => Promise.resolve('error' as const));

          expect(await fn()).toEqual(err('error'));
          expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<never, 'error'>>>();
        });

        it('can return an ok result', async () => {
          const fn = fromThrowable(throwable, () => ok('data'));

          expect(fn()).toEqual(ok('data'));
          expectTypeOf(fn).toEqualTypeOf<() => Result<'data', never>>();
        });

        it('can return mixed value types (sync)', async () => {
          const fn = fromThrowable(throwable, () => {
            if (Math.random() > -1) return 'error' as const;
            if (Math.random() > 1) return ok('data');
            if (Math.random() > 1) return err({ code: 404 });
            if (Math.random() > 1) return ok({ foo: 'bar' });
            return { status: 'failed' };
          });

          expect(fn()).toEqual(err('error'));
          expectTypeOf(fn).toEqualTypeOf<
            () => Result<
              'data' | { readonly foo: 'bar' },
              'error' | { readonly code: 404 } | { readonly status: 'failed' }
            >
          >();
        });

        it('can return mixed value types (async)', async () => {
          const fn = fromThrowable(throwable, async () => {
            if (Math.random() > -1) return 'error' as const;
            if (Math.random() > 1) return ok('data');
            if (Math.random() > 1) return err({ code: 404 });
            if (Math.random() > 1) return ok({ foo: 'bar' });
            return { status: 'failed' };
          });

          expect(await fn()).toEqual(err('error'));
          expectTypeOf(fn).toEqualTypeOf<
            () => Promise<
              Result<'data' | { readonly foo: 'bar' }, 'error' | { readonly code: 404 } | { readonly status: 'failed' }>
            >
          >();
        });

        it('allows custom error mapping', async () => {
          const error = new Error('promise error');
          const fn = fromThrowable(
            () => {
              throw error;
            },
            (ex) => (ex instanceof Error ? ex : 'UNKNOWN_ERROR'),
          );

          expect(fn()).toEqual(err(error));
          expectTypeOf(fn).toEqualTypeOf<() => Result<never, Error | 'UNKNOWN_ERROR'>>();
        });
      });
    });

    describe('async', () => {
      describe('fn', () => {
        it('handles resolving async functions', async () => {
          const fn = fromThrowable(async () => Promise.resolve(42), 'error');

          expect(await fn()).toEqual(ok(42));
          expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<number, 'error'>>>();
        });

        it('handles rejecting async functions', async () => {
          const fn = fromThrowable(async () => {
            throw new Error('test error');
            // biome-ignore lint/correctness/noUnreachable: needed for type inference
            return Promise.resolve(42);
          }, 'caught error');

          expect(await fn()).toEqual(err('caught error'));
          expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<number, 'caught error'>>>();
        });

        it('infers function parameters', async () => {
          const fn = fromThrowable(async (a: number, b: number) => a / b, 'error');

          expect(await fn(1, 2)).toEqual(ok(0.5));
          expectTypeOf(fn).toEqualTypeOf<(a: number, b: number) => Promise<Result<number, 'error'>>>();
        });
      });

      describe('catch', () => {
        const throwable = () => Promise.reject(new Error('throwable error'));

        it('can be a value', async () => {
          const fn = fromThrowable(throwable, 'error');

          expect(await fn()).toEqual(err('error'));
          expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<never, 'error'>>>();
        });

        it('can be a function', async () => {
          const fn = fromThrowable(throwable, () => 'error' as const);

          expect(await fn()).toEqual(err('error'));
          expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<never, 'error'>>>();
        });

        it('can be a promise', async () => {
          const fn = fromThrowable(throwable, Promise.resolve('error' as const));

          expect(await fn()).toEqual(err('error'));
          expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<never, 'error'>>>();
        });

        it('can be an async function', async () => {
          const fn = fromThrowable(throwable, () => Promise.resolve('error' as const));

          expect(await fn()).toEqual(err('error'));
          expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<never, 'error'>>>();
        });

        it('can return an ok result', async () => {
          const fn = fromThrowable(throwable, () => ok('data'));

          expect(await fn()).toEqual(ok('data'));
          expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<'data', never>>>();
        });

        it('can return mixed value types (sync)', async () => {
          const fn = fromThrowable(throwable, () => {
            if (Math.random() > -1) return 'error' as const;
            if (Math.random() > 1) return ok('data');
            if (Math.random() > 1) return err({ code: 404 });
            if (Math.random() > 1) return ok({ foo: 'bar' });
            return { status: 'failed' };
          });

          expect(await fn()).toEqual(err('error'));
          expectTypeOf(fn).toEqualTypeOf<
            () => Promise<
              Result<'data' | { readonly foo: 'bar' }, 'error' | { readonly code: 404 } | { readonly status: 'failed' }>
            >
          >();
        });

        it('can return mixed value types (async)', async () => {
          const fn = fromThrowable(throwable, async () => {
            if (Math.random() > -1) return 'error' as const;
            if (Math.random() > 1) return ok('data');
            if (Math.random() > 1) return err({ code: 404 });
            if (Math.random() > 1) return ok({ foo: 'bar' });
            return { status: 'failed' };
          });

          expect(await fn()).toEqual(err('error'));
          expectTypeOf(fn).toEqualTypeOf<
            () => Promise<
              Result<'data' | { readonly foo: 'bar' }, 'error' | { readonly code: 404 } | { readonly status: 'failed' }>
            >
          >();
        });

        it('allows custom error mapping', async () => {
          const error = new Error('promise error');
          const fn = fromThrowable(
            () => Promise.reject(error),
            (ex) => (ex instanceof Error ? ex : 'UNKNOWN_ERROR'),
          );

          expect(await fn()).toEqual(err(error));
          expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<never, Error | 'UNKNOWN_ERROR'>>>();
        });
      });
    });
  });

  describe('tryCatch', () => {
    describe('sync', () => {
      describe('try', () => {
        it('handles successful functions', () => {
          const result = tryCatch(() => 42, 'error');

          expect(result).toEqual(ok(42));
          expectTypeOf(result).toEqualTypeOf<Result<number, 'error'>>();
        });

        it('handles throwing functions', () => {
          const result = tryCatch(() => {
            throw new Error('test error');
            // biome-ignore lint/correctness/noUnreachable: needed for type inference
            return 42;
          }, 'caught error');

          expect(result).toEqual(err('caught error'));
          expectTypeOf(result).toEqualTypeOf<Result<number, 'caught error'>>();
        });
      });

      describe('catch', () => {
        const throwable = () => {
          throw new Error('throwable error');
        };

        it('can be a value', async () => {
          const result = tryCatch(throwable, 'error');

          expect(result).toEqual(err('error'));
          expectTypeOf(result).toEqualTypeOf<Result<never, 'error'>>();
        });

        it('can be a function', async () => {
          const result = tryCatch(throwable, () => 'error' as const);

          expect(result).toEqual(err('error'));
          expectTypeOf(result).toEqualTypeOf<Result<never, 'error'>>();
        });

        it('can be a promise', async () => {
          const result = tryCatch(throwable, Promise.resolve('error' as const));

          expect(await result).toEqual(err('error'));
          expectTypeOf(result).toEqualTypeOf<Promise<Result<never, 'error'>>>();
        });

        it('can be an async function', async () => {
          const result = tryCatch(throwable, () => Promise.resolve('error' as const));

          expect(await result).toEqual(err('error'));
          expectTypeOf(result).toEqualTypeOf<Promise<Result<never, 'error'>>>();
        });

        it('can return an ok result', async () => {
          const result = tryCatch(throwable, () => ok('data'));

          expect(result).toEqual(ok('data'));
          expectTypeOf(result).toEqualTypeOf<Result<'data', never>>();
        });

        it('can return mixed value types', async () => {
          const result = tryCatch(throwable, () => {
            if (Math.random() > -1) return 'error' as const;
            if (Math.random() > 1) return ok('data');
            if (Math.random() > 1) return err({ code: 404 });
            if (Math.random() > 1) return ok({ foo: 'bar' });
            return { status: 'failed' };
          });

          expect(result).toEqual(err('error'));
          expectTypeOf(result).toEqualTypeOf<
            Result<'data' | { readonly foo: 'bar' }, 'error' | { readonly code: 404 } | { readonly status: 'failed' }>
          >();
        });

        it('allows custom error mapping', async () => {
          const error = new Error('promise error');
          const result = tryCatch(
            () => {
              throw error;
            },
            (ex) => (ex instanceof Error ? ex : 'UNKNOWN_ERROR'),
          );

          expect(result).toEqual(err(error));
          expectTypeOf(result).toEqualTypeOf<Result<never, Error | 'UNKNOWN_ERROR'>>();
        });
      });
    });

    describe('async', () => {
      describe('try', () => {
        it('handles resolving async functions', async () => {
          const result = tryCatch(async () => Promise.resolve(42), 'error');

          expect(await result).toEqual(ok(42));
          expectTypeOf(result).toEqualTypeOf<Promise<Result<number, 'error'>>>();
        });

        it('handles rejecting async functions', async () => {
          const result = tryCatch(async () => {
            throw new Error('test error');
            // biome-ignore lint/correctness/noUnreachable: needed for type inference
            return Promise.resolve(42);
          }, 'caught error');

          expect(await result).toEqual(err('caught error'));
          expectTypeOf(result).toEqualTypeOf<Promise<Result<number, 'caught error'>>>();
        });

        it('handles resolved promises', async () => {
          const result = tryCatch(Promise.resolve(42), 'error');

          expect(await result).toEqual(ok(42));
          expectTypeOf(result).toEqualTypeOf<Promise<Result<number, 'error'>>>();
        });

        it('handles rejected promises', async () => {
          const result = tryCatch(Promise.reject(new Error('promise error')), 'error');

          expect(await result).toEqual(err('error'));
          expectTypeOf(result).toEqualTypeOf<Promise<Result<never, 'error'>>>();
        });
      });

      describe('catch', () => {
        const throwable = () => Promise.reject(new Error('throwable error'));

        it('can be a value', async () => {
          const result = tryCatch(throwable, 'error');

          expect(await result).toEqual(err('error'));
          expectTypeOf(result).toEqualTypeOf<Promise<Result<never, 'error'>>>();
        });

        it('can be a function', async () => {
          const result = tryCatch(throwable, () => 'error' as const);

          expect(await result).toEqual(err('error'));
          expectTypeOf(result).toEqualTypeOf<Promise<Result<never, 'error'>>>();
        });

        it('can be a promise', async () => {
          const result = tryCatch(throwable, Promise.resolve('error' as const));

          expect(await result).toEqual(err('error'));
          expectTypeOf(result).toEqualTypeOf<Promise<Result<never, 'error'>>>();
        });

        it('can be an async function', async () => {
          const result = tryCatch(throwable, () => Promise.resolve('error' as const));

          expect(await result).toEqual(err('error'));
          expectTypeOf(result).toEqualTypeOf<Promise<Result<never, 'error'>>>();
        });

        it('can return an ok result', async () => {
          const result = tryCatch(throwable, () => ok('data'));

          expect(await result).toEqual(ok('data'));
          expectTypeOf(result).toEqualTypeOf<Promise<Result<'data', never>>>();
        });

        it('can return mixed value types', async () => {
          const result = tryCatch(throwable, async () => {
            if (Math.random() > -1) return 'error' as const;
            if (Math.random() > 1) return ok('data');
            if (Math.random() > 1) return err({ code: 404 });
            if (Math.random() > 1) return ok({ foo: 'bar' });
            return { status: 'failed' };
          });

          expect(await result).toEqual(err('error'));
          expectTypeOf(result).toEqualTypeOf<
            Promise<
              Result<'data' | { readonly foo: 'bar' }, 'error' | { readonly code: 404 } | { readonly status: 'failed' }>
            >
          >();
        });

        it('allows custom error mapping', async () => {
          const error = new Error('promise error');
          const result = tryCatch(
            () => Promise.reject(error),
            (ex) => (ex instanceof Error ? ex : 'UNKNOWN_ERROR'),
          );

          expect(await result).toEqual(err(error));
          expectTypeOf(result).toEqualTypeOf<Promise<Result<never, Error | 'UNKNOWN_ERROR'>>>();
        });
      });
    });
  });

  describe('mapOk', () => {
    it('maps the data of an Ok result', () => {
      const result = mapOk(ok(42), (data) => data * 2);

      expect(result).toEqual(ok(84));
      expectTypeOf(result).toEqualTypeOf<Result<number, never>>();
    });

    it('skips the mapping for an Err result', () => {
      const result = mapOk(err('error'), (data) => data * 2);

      expect(result).toEqual(err('error'));
      expectTypeOf(result).toEqualTypeOf<Result<number, 'error'>>();
    });

    it('allows to change response type', () => {
      const result = mapOk(ok(42), (data) => {
        if (data > 100) return { size: 'large' };
        if (data > 50) return ['size', 'medium'];
        return 'small';
      });

      expect(result).toEqual(ok('small'));
      expectTypeOf(result).toEqualTypeOf<
        Result<'small' | readonly ['size', 'medium'] | { readonly size: 'large' }, never>
      >();
    });

    it('allows to extend error type', () => {
      const fn = (data: number) => (data > 0 ? err({ code: 404 }) : ok(data * 2));

      const okResult = mapOk(ok(42), fn);

      expect(okResult).toEqual(err({ code: 404 }));
      expectTypeOf(okResult).toEqualTypeOf<Result<number, { readonly code: 404 }>>();

      const errResult = mapOk(err('error'), fn);

      expect(errResult).toEqual(err('error'));
      expectTypeOf(errResult).toEqualTypeOf<Result<number, 'error' | { readonly code: 404 }>>();
    });

    it('handles mixed return types', () => {
      const result = mapOk(ok(42), (data) => {
        if (data > 100) return { size: 'large' };
        if (data > 50) return ok(['size', 'medium']);
        if (data < 0) return err('negative number');
        if (data < -100) return err({ code: 404 });
        return 'small';
      });

      expect(result).toEqual(ok('small'));
      expectTypeOf(result).toEqualTypeOf<
        Result<
          'small' | readonly ['size', 'medium'] | { readonly size: 'large' },
          'negative number' | { readonly code: 404 }
        >
      >();
    });

    it('handles promises as the first argument', async () => {
      const okResult = mapOk(Promise.resolve(ok(42)), (data) => (data ? ok('ok') : err('error')));

      expect(await okResult).toEqual(ok('ok'));
      expectTypeOf(okResult).toEqualTypeOf<Promise<Result<'ok', 'error'>>>();

      const errResult = mapOk(Promise.resolve(err('error')), (data) => (data ? ok('ok') : err('error')));

      expect(await errResult).toEqual(err('error'));
      expectTypeOf(errResult).toEqualTypeOf<Promise<Result<'ok', 'error'>>>();
    });

    it('handles async functions as the second argument', async () => {
      const okResult = mapOk(ok(42), async (data) => (data ? ok('ok') : err('error')));

      expect(await okResult).toEqual(ok('ok'));
      expectTypeOf(okResult).toEqualTypeOf<Promise<Result<'ok', 'error'>>>();

      const errResult = mapOk(err('error'), async (data) => (data ? ok('ok') : err('error')));

      expect(await errResult).toEqual(err('error'));
      expectTypeOf(errResult).toEqualTypeOf<Promise<Result<'ok', 'error'>>>();
    });
  });

  describe('mapErr', () => {
    it('maps the error of an Err result', () => {
      const result = mapErr(err(404), (error) => (error === 404 ? 'not-found' : 'other'));

      expect(result).toEqual(err('not-found'));
      expectTypeOf(result).toEqualTypeOf<Result<never, 'not-found' | 'other'>>();
    });

    it('skips the mapping for an Ok result', () => {
      const result = mapErr(ok(42), (error) => (error === 404 ? 'not-found' : 'other'));

      expect(result).toEqual(ok(42));
      expectTypeOf(result).toEqualTypeOf<Result<42, 'not-found' | 'other'>>();
    });

    it('allows to change response type', () => {
      const result = mapErr(err(404), (error) => {
        if (error > 500) return { type: 'server-error' };
        if (error > 400) return ['type', 'client-error'];
        return 'unknown-error';
      });

      expect(result).toEqual(err(['type', 'client-error']));
      expectTypeOf(result).toEqualTypeOf<
        Result<never, 'unknown-error' | readonly ['type', 'client-error'] | { readonly type: 'server-error' }>
      >();
    });

    it('allows to extend success type', () => {
      const okResult = mapErr(ok(42), (data) => (data ? err('error') : ok('ok')));

      expect(okResult).toEqual(ok(42));
      expectTypeOf(okResult).toEqualTypeOf<Result<42 | 'ok', 'error'>>();

      const errResult = mapErr(err(404), (data) => (data ? err('error') : ok('ok')));

      expect(errResult).toEqual(err('error'));
      expectTypeOf(errResult).toEqualTypeOf<Result<'ok', 'error'>>();
    });

    it('handles mixed return types', () => {
      const result = mapErr(err(404), (error) => {
        if (error > 100) return { size: 'large' };
        if (error > 50) return ok(['size', 'medium']);
        if (error < 0) return err('negative number');
        if (error < -100) return err({ code: 404 });
        return 'small';
      });

      expect(result).toEqual(err({ size: 'large' }));
      expectTypeOf(result).toEqualTypeOf<
        Result<
          readonly ['size', 'medium'],
          'small' | 'negative number' | { readonly code: 404 } | { readonly size: 'large' }
        >
      >();
    });

    it('handles promises as the first argument', async () => {
      const okResult = mapErr(Promise.resolve(ok(42)), (data) => (data ? err('error') : ok('ok')));

      expect(await okResult).toEqual(ok(42));
      expectTypeOf(okResult).toEqualTypeOf<Promise<Result<42 | 'ok', 'error'>>>();

      const errResult = mapErr(Promise.resolve(err('error')), (data) => (data ? err('error') : ok('ok')));

      expect(await errResult).toEqual(err('error'));
      expectTypeOf(errResult).toEqualTypeOf<Promise<Result<'ok', 'error'>>>();
    });

    it('handles async functions as the second argument', async () => {
      const okResult = mapErr(ok(42), async (data) => (data ? err('error') : ok('ok')));

      expect(await okResult).toEqual(ok(42));
      expectTypeOf(okResult).toEqualTypeOf<Promise<Result<42 | 'ok', 'error'>>>();

      const errResult = mapErr(err('error'), async (data) => (data ? err('error') : ok('ok')));

      expect(await errResult).toEqual(err('error'));
      expectTypeOf(errResult).toEqualTypeOf<Promise<Result<'ok', 'error'>>>();
    });
  });

  describe('match', () => {
    it('matches on Ok', () => {
      const okType = match(
        ok('ok'),
        (data) => data,
        (error) => error,
      );

      expect(okType).toBe('ok');
      expectTypeOf(okType).toEqualTypeOf<'ok'>();

      const mixedType = match(
        first(ok('ok'), err('error')),
        (data) => data,
        (error) => error,
      );

      expect(mixedType).toBe('ok');
      expectTypeOf(mixedType).toEqualTypeOf<'ok' | 'error'>();
    });

    it('matches on Err', () => {
      const errType = match(
        err('error'),
        (data) => data,
        (error) => error,
      );

      expect(errType).toBe('error');
      expectTypeOf(errType).toEqualTypeOf<'error'>();

      const mixedType = match(
        first(err('error'), ok('ok')),
        (data) => data,
        (error) => error,
      );

      expect(mixedType).toBe('error');
      expectTypeOf(mixedType).toEqualTypeOf<'ok' | 'error'>();
    });

    it('allows mixed static and function mappers', () => {
      const allStatic = match(first(ok('ok'), err('err')), 'success', 'error');
      expect(allStatic).toBe('success');
      expectTypeOf(allStatic).toEqualTypeOf<'success' | 'error'>();

      const okIsFn = match(first(ok('ok'), err('err')), (data) => data, 'error');
      expect(okIsFn).toBe('ok');
      expectTypeOf(okIsFn).toEqualTypeOf<'ok' | 'error'>();

      const errIsFn = match(first(ok('ok'), err('err')), 'success', (error) => error);
      expect(errIsFn).toBe('success');
      expectTypeOf(errIsFn).toEqualTypeOf<'success' | 'err'>();

      const allFn = match(
        first(ok('ok'), err('err')),
        (data) => data,
        (error) => error,
      );
      expect(allFn).toBe('ok');
      expectTypeOf(allFn).toEqualTypeOf<'ok' | 'err'>();
    });

    it('works with promises', async () => {
      const okResult = match(
        Promise.resolve(ok('ok')),
        (data) => data,
        (error) => error,
      );
      expect(await okResult).toBe('ok');
      expectTypeOf(okResult).toEqualTypeOf<Promise<'ok'>>();

      const errResult = match(
        Promise.resolve(err('error')),
        (data) => data,
        (error) => error,
      );
      expect(await errResult).toBe('error');
      expectTypeOf(errResult).toEqualTypeOf<Promise<'error'>>();
    });

    it('works with async mappers', async () => {
      const asyncOkMapper = match(
        first(ok('ok'), err('error')),
        async (data) => data,
        (error) => error,
      );

      expect(await asyncOkMapper).toBe('ok');
      expectTypeOf(asyncOkMapper).toEqualTypeOf<Promise<'ok' | 'error'>>();

      const asyncErrMapper = match(
        first(ok('ok'), err('error')),
        (data) => data,
        async (error) => error,
      );

      expect(await asyncErrMapper).toBe('ok');
      expectTypeOf(asyncErrMapper).toEqualTypeOf<Promise<'ok' | 'error'>>();
    });

    it('allows mixed promise and async function mappers', async () => {
      const allStatic = match(
        first(ok('ok'), err('err')),
        Promise.resolve('success' as const),
        Promise.resolve('error' as const),
      );
      expect(await allStatic).toBe('success');
      expectTypeOf(allStatic).toEqualTypeOf<Promise<'success' | 'error'>>();

      const okIsFn = match(first(ok('ok'), err('err')), async (data) => data, Promise.resolve('error' as const));
      expect(await okIsFn).toBe('ok');
      expectTypeOf(okIsFn).toEqualTypeOf<Promise<'ok' | 'error'>>();

      const errIsFn = match(first(ok('ok'), err('err')), Promise.resolve('success' as const), async (error) => error);
      expect(await errIsFn).toBe('success');
      expectTypeOf(errIsFn).toEqualTypeOf<Promise<'success' | 'err'>>();

      const allFn = match(
        first(ok('ok'), err('err')),
        async (data) => data,
        async (error) => error,
      );
      expect(await allFn).toBe('ok');
      expectTypeOf(allFn).toEqualTypeOf<Promise<'ok' | 'err'>>();
    });

    it('allows mixed return types', async () => {
      const syncValue = match(
        first(ok('ok'), err('error')),
        (data) => (data ? { data } : 'negative_value'),
        (error) => (error ? { error } : 'unknown_error'),
      );

      expect(syncValue).toEqual({ data: 'ok' });
      expectTypeOf(syncValue).toEqualTypeOf<
        { readonly data: 'ok' } | 'negative_value' | { readonly error: 'error' } | 'unknown_error'
      >();

      const asyncValue = match(
        first(ok('ok'), err('error')),
        (data) => (data ? { data } : 'negative_value'),
        async (error) => (error ? { error } : 'unknown_error'),
      );

      expect(await asyncValue).toEqual({ data: 'ok' });
      expectTypeOf(asyncValue).toEqualTypeOf<
        Promise<'negative_value' | 'unknown_error' | { readonly data: 'ok' } | { readonly error: 'error' }>
      >();
    });
  });
});
