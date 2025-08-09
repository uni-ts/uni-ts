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
  toTuple,
  tryCatch,
  unwrapOr,
  unwrapOrNull,
  unwrapOrThrow,
  unwrapOrUndefined,
} from './index.js';

describe('index.ts', () => {
  describe('Basic interfaces', () => {
    it('Ok', () => {
      expectTypeOf<Ok<string>>().toEqualTypeOf<{ success: true; data: string }>();
      expectTypeOf<Ok<number>>().toEqualTypeOf<{ success: true; data: number }>();
      expectTypeOf<Ok<{ foo: string }>>().toEqualTypeOf<{ success: true; data: { foo: string } }>();
      expectTypeOf<Ok>().toEqualTypeOf<{ success: true; data: any }>();
    });

    it('Err', () => {
      expectTypeOf<Err<string>>().toEqualTypeOf<{ success: false; error: string }>();
      expectTypeOf<Err<Error>>().toEqualTypeOf<{ success: false; error: Error }>();
      expectTypeOf<Err<{ code: number }>>().toEqualTypeOf<{ success: false; error: { code: number } }>();
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
    it('infers Ok types from result', () => {
      type SimpleResult = Result<string, Error>;
      expectTypeOf<InferOk<SimpleResult>>().toEqualTypeOf<Ok<string>>();
    });

    it('infers Ok types from promise result', () => {
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
    it('infers Err types from result', () => {
      type SimpleResult = Result<string, Error>;
      expectTypeOf<InferErr<SimpleResult>>().toEqualTypeOf<Err<Error>>();
    });

    it('infers Err types from function return types', () => {
      type SyncFn = () => Result<number, string>;
      expectTypeOf<InferErr<SyncFn>>().toEqualTypeOf<Err<string>>();

      type AsyncFn = () => Promise<Result<boolean, Error>>;
      expectTypeOf<InferErr<AsyncFn>>().toEqualTypeOf<Err<Error>>();
    });

    it('infers Err types from promise result', () => {
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

    it('creates immutable values for different data types', () => {
      expect(ok('data')).toEqual({ success: true, data: 'data' });
      expectTypeOf(ok('data')).toEqualTypeOf<Ok<'data'>>();

      expect(ok(42)).toEqual({ success: true, data: 42 });
      expectTypeOf(ok(42)).toEqualTypeOf<Ok<42>>();

      expect(ok(true)).toEqual({ success: true, data: true });
      expectTypeOf(ok(true)).toEqualTypeOf<Ok<true>>();

      expect(ok({ foo: 'bar' })).toEqual({ success: true, data: { foo: 'bar' } });
      expectTypeOf(ok({ foo: 'bar' })).toEqualTypeOf<Ok<{ readonly foo: 'bar' }>>();

      expect(ok([1, 2, 3])).toEqual({ success: true, data: [1, 2, 3] });
      expectTypeOf(ok([1, 2, 3])).toEqualTypeOf<Ok<readonly [1, 2, 3]>>();
    });
  });

  describe('err', () => {
    it('creates an Err result', () => {
      const result = err('some error');

      expect(result).toEqual({ success: false, error: 'some error' });
      expectTypeOf(result).toEqualTypeOf<Err<'some error'>>();
    });

    it('creates immutable values for different error types', () => {
      expect(err('data')).toEqual({ success: false, error: 'data' });
      expectTypeOf(err('data')).toEqualTypeOf<Err<'data'>>();

      expect(err(42)).toEqual({ success: false, error: 42 });
      expectTypeOf(err(42)).toEqualTypeOf<Err<42>>();

      expect(err(true)).toEqual({ success: false, error: true });
      expectTypeOf(err(true)).toEqualTypeOf<Err<true>>();

      expect(err({ foo: 'bar' })).toEqual({ success: false, error: { foo: 'bar' } });
      expectTypeOf(err({ foo: 'bar' })).toEqualTypeOf<Err<{ readonly foo: 'bar' }>>();

      expect(err([1, 2, 3])).toEqual({ success: false, error: [1, 2, 3] });
      expectTypeOf(err([1, 2, 3])).toEqualTypeOf<Err<readonly [1, 2, 3]>>();
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

      const value = first(ok(42), err('error'), 'test' as const);

      if (isResult(value)) {
        expectTypeOf(value).toEqualTypeOf<Result<42, 'error'>>();
      } else {
        expectTypeOf(value).toEqualTypeOf<'test'>();
      }
    });
  });

  describe('isOk', () => {
    it('returns true for Ok results', () => {
      expect(isOk(ok('data'))).toBe(true);
    });

    it('returns false for Err results', () => {
      expect(isOk(err('error'))).toBe(false);
    });

    it('casts value to Ok result type', () => {
      expectTypeOf(isOk).guards.toExtend<Ok>();

      const value = first(ok(42), err('error'));

      if (isOk(value)) {
        expectTypeOf(value).toEqualTypeOf<Ok<42>>();
      } else {
        expectTypeOf(value).toEqualTypeOf<Err<'error'>>();
      }
    });

    it('only accepts Result type as argument', () => {
      // @ts-expect-error - value is not of a Result type
      expect(isOk({})).toBe(false);
    });
  });

  describe('isOkResult', () => {
    it('returns true for Ok results', () => {
      expect(isOkResult(ok('data'))).toBe(true);
    });

    it('returns false for Err results', () => {
      expect(isOkResult(err('error'))).toBe(false);
    });

    it('accepts any type as argument', () => {
      expect(isOkResult('test')).toBe(false);
      expect(isOkResult(42)).toBe(false);
      expect(isOkResult(true)).toBe(false);
      expect(isOkResult({})).toBe(false);
      expect(isOkResult([])).toBe(false);
    });

    it('casts value to Ok result type', () => {
      expectTypeOf(isOkResult).guards.toExtend<Ok>();

      const value = first(ok(42), err('error'), [], { foo: 'bar' });

      if (isOkResult(value)) {
        expectTypeOf(value).toEqualTypeOf<Ok<42>>();
      } else {
        expectTypeOf(value).toEqualTypeOf<Err<'error'> | readonly [] | { readonly foo: 'bar' }>();
      }
    });
  });

  describe('isErr', () => {
    it('returns true for Err results', () => {
      expect(isErr(err('error'))).toBe(true);
    });

    it('returns false for Ok results', () => {
      expect(isErr(ok('data'))).toBe(false);
    });

    it('casts value to Err result type', () => {
      expectTypeOf(isErr).guards.toExtend<Err>();

      const value = first(ok(42), err('error'));

      if (isErr(value)) {
        expectTypeOf(value).toEqualTypeOf<Err<'error'>>();
      } else {
        expectTypeOf(value).toEqualTypeOf<Ok<42>>();
      }
    });

    it('only accepts Result type as argument', () => {
      // @ts-expect-error - value is not of a Result type
      expect(isErr({})).toBe(false);
    });
  });

  describe('isErrResult', () => {
    it('returns true for Err results', () => {
      expect(isErrResult(err('error'))).toBe(true);
    });

    it('returns false for Ok results', () => {
      expect(isErrResult(ok('data'))).toBe(false);
    });

    it('accepts any type as argument', () => {
      expect(isErrResult('test')).toBe(false);
      expect(isErrResult(42)).toBe(false);
      expect(isErrResult(true)).toBe(false);
      expect(isErrResult({})).toBe(false);
      expect(isErrResult([])).toBe(false);
    });

    it('casts value to Err result type', () => {
      expectTypeOf(isErrResult).guards.toExtend<Err>();

      const value = first(ok(42), err('error'), [], { foo: 'bar' });

      if (isErrResult(value)) {
        expectTypeOf(value).toEqualTypeOf<Err<'error'>>();
      } else {
        expectTypeOf(value).toEqualTypeOf<Ok<42> | readonly [] | { readonly foo: 'bar' }>();
      }
    });
  });

  describe('unwrapOr', () => {
    it('returns the data for Ok results', () => {
      expect(unwrapOr(ok('data'), null)).toBe('data');
      expectTypeOf(unwrapOr(ok('data'), null)).toEqualTypeOf<'data' | null>();
    });

    it('returns the provided value for Err results', () => {
      expect(unwrapOr(err('error'), null)).toBe(null);
      expectTypeOf(unwrapOr(err('error'), null)).toEqualTypeOf<null>();
    });

    it('preserves error type in function parameter', () => {
      const value = unwrapOr(err({ code: 404, message: 'Not found' }), (error) => {
        expectTypeOf(error).toEqualTypeOf<Readonly<{ code: 404; message: 'Not found' }>>();
        return `Error ${error.code}: ${error.message}`;
      });

      expect(value).toBe('Error 404: Not found');
      expectTypeOf(value).toEqualTypeOf<'Error 404: Not found'>();
    });

    describe('works with different data types', () => {
      const okInput = first(ok('data'), ok({ foo: 'bar' }), err('error1'), err({ code: 404 }));
      const errInput = first(err('error1'), err({ code: 404 }), ok('data'), ok({ foo: 'bar' }));
      const staticOnErr = first('error2', { error: 'error' });
      const fnOnErr = <T>(error: T) => first('error2', { error });
      const asyncFnOnErr = async <T>(error: T) => first('error2', { error });

      type StaticResult = 'data' | { readonly foo: 'bar' } | 'error2' | { readonly error: 'error' };
      type FnResult =
        | 'data'
        | { readonly foo: 'bar' }
        | 'error2'
        | { readonly error: 'error1' | { readonly code: 404 } };

      describe('static input', () => {
        it('static onErr', () => {
          const okValue = unwrapOr(okInput, staticOnErr);

          expect(okValue).toBe('data');
          expectTypeOf(okValue).toEqualTypeOf<StaticResult>();

          const errValue = unwrapOr(errInput, staticOnErr);

          expect(errValue).toBe('error2');
          expectTypeOf(errValue).toEqualTypeOf<StaticResult>();
        });

        it('promise onErr', async () => {
          const okValue = unwrapOr(okInput, Promise.resolve(staticOnErr));

          expect(await okValue).toBe('data');
          expectTypeOf(okValue).toEqualTypeOf<Promise<StaticResult>>();

          const errValue = unwrapOr(errInput, Promise.resolve(staticOnErr));

          expect(await errValue).toBe('error2');
          expectTypeOf(errValue).toEqualTypeOf<Promise<StaticResult>>();
        });

        it('function onErr', () => {
          const okValue = unwrapOr(okInput, fnOnErr);

          expect(okValue).toBe('data');
          expectTypeOf(okValue).toEqualTypeOf<FnResult>();

          const errValue = unwrapOr(errInput, fnOnErr);

          expect(errValue).toBe('error2');
          expectTypeOf(errValue).toEqualTypeOf<FnResult>();
        });

        it('async function onErr', async () => {
          const okValue = unwrapOr(okInput, (e) => asyncFnOnErr(e));

          expect(await okValue).toBe('data');
          expectTypeOf(okValue).toEqualTypeOf<Promise<FnResult>>();

          const errValue = unwrapOr(errInput, (e) => asyncFnOnErr(e));

          expect(await errValue).toBe('error2');
          expectTypeOf(errValue).toEqualTypeOf<Promise<FnResult>>();
        });
      });

      describe('promise input', () => {
        it('static onErr', async () => {
          const okValue = unwrapOr(Promise.resolve(okInput), staticOnErr);

          expect(await okValue).toBe('data');
          expectTypeOf(okValue).toEqualTypeOf<Promise<StaticResult>>();

          const errValue = unwrapOr(Promise.resolve(errInput), staticOnErr);

          expect(await errValue).toBe('error2');
          expectTypeOf(errValue).toEqualTypeOf<Promise<StaticResult>>();
        });

        it('promise onErr', async () => {
          const okValue = unwrapOr(Promise.resolve(okInput), Promise.resolve(staticOnErr));

          expect(await okValue).toBe('data');
          expectTypeOf(okValue).toEqualTypeOf<Promise<StaticResult>>();

          const errValue = unwrapOr(Promise.resolve(errInput), Promise.resolve(staticOnErr));

          expect(await errValue).toBe('error2');
          expectTypeOf(errValue).toEqualTypeOf<Promise<StaticResult>>();
        });

        it('function onErr', async () => {
          const okValue = unwrapOr(Promise.resolve(okInput), (e) => fnOnErr(e));

          expect(await okValue).toBe('data');
          expectTypeOf(okValue).toEqualTypeOf<Promise<FnResult>>();

          const errValue = unwrapOr(Promise.resolve(errInput), (e) => fnOnErr(e));

          expect(await errValue).toBe('error2');
          expectTypeOf(errValue).toEqualTypeOf<Promise<FnResult>>();
        });

        it('async function onErr', async () => {
          const okValue = unwrapOr(Promise.resolve(okInput), (e) => asyncFnOnErr(e));

          expect(await okValue).toBe('data');
          expectTypeOf(okValue).toEqualTypeOf<Promise<FnResult>>();

          const errValue = unwrapOr(Promise.resolve(errInput), (e) => asyncFnOnErr(e));

          expect(await errValue).toBe('error2');
          expectTypeOf(errValue).toEqualTypeOf<Promise<FnResult>>();
        });
      });
    });
  });

  describe('unwrapOrThrow', () => {
    it('returns the data for Ok results', () => {
      expect(unwrapOrThrow(ok('data'))).toBe('data');
      expectTypeOf(unwrapOrThrow(ok('data'))).toEqualTypeOf<'data'>();
    });

    it('throws an error for Err results', () => {
      expect(() => unwrapOrThrow(err('error'))).toThrow('error');
      expectTypeOf(() => unwrapOrThrow(err('error'))).returns.toEqualTypeOf<never>();
    });

    describe('works with different data types', () => {
      const okInput = first(ok('data'), ok({ foo: 'bar' }), err('error1'), err({ code: 404 }));
      const errInput = first(err('error1'), err({ code: 404 }), ok('data'), ok({ foo: 'bar' }));

      type StaticResult = 'data' | { readonly foo: 'bar' };

      it('static input', () => {
        expect(unwrapOrThrow(okInput)).toBe('data');
        expectTypeOf(unwrapOrThrow(okInput)).toEqualTypeOf<StaticResult>();

        expect(() => unwrapOrThrow(errInput)).toThrow('error');
        expectTypeOf(() => unwrapOrThrow(errInput)).returns.toEqualTypeOf<StaticResult>();
      });

      it('promise input', async () => {
        expect(await unwrapOrThrow(Promise.resolve(okInput))).toBe('data');
        expectTypeOf(unwrapOrThrow(Promise.resolve(okInput))).toEqualTypeOf<Promise<StaticResult>>();

        await expect(unwrapOrThrow(Promise.resolve(errInput))).rejects.toThrow('error');
        expectTypeOf(() => unwrapOrThrow(Promise.resolve(errInput))).returns.toEqualTypeOf<Promise<StaticResult>>();
      });
    });
  });

  describe('unwrapOrNull', () => {
    it('returns the data for Ok results', () => {
      expect(unwrapOrNull(ok('data'))).toBe('data');
      expectTypeOf(unwrapOrNull(ok('data'))).toEqualTypeOf<'data' | null>();
    });

    it('returns null for Err results', () => {
      expect(unwrapOrNull(err('error'))).toBeNull();
      expectTypeOf(unwrapOrNull(err('error'))).toEqualTypeOf<null>();
    });

    describe('works with different data types', () => {
      const okInput = first(ok('data'), ok({ foo: 'bar' }), err('error1'), err({ code: 404 }));
      const errInput = first(err('error1'), err({ code: 404 }), ok('data'), ok({ foo: 'bar' }));

      type StaticResult = 'data' | { readonly foo: 'bar' } | null;

      it('static input', () => {
        expect(unwrapOrNull(okInput)).toBe('data');
        expectTypeOf(unwrapOrNull(okInput)).toEqualTypeOf<StaticResult>();

        expect(unwrapOrNull(errInput)).toBeNull();
        expectTypeOf(() => unwrapOrNull(errInput)).returns.toEqualTypeOf<StaticResult>();
      });

      it('promise input', async () => {
        expect(await unwrapOrNull(Promise.resolve(okInput))).toBe('data');
        expectTypeOf(unwrapOrNull(Promise.resolve(okInput))).toEqualTypeOf<Promise<StaticResult>>();

        expect(await unwrapOrNull(Promise.resolve(errInput))).toBeNull();
        expectTypeOf(() => unwrapOrNull(Promise.resolve(errInput))).returns.toEqualTypeOf<Promise<StaticResult>>();
      });
    });
  });

  describe('unwrapOrUndefined', () => {
    it('returns the data for Ok results', () => {
      expect(unwrapOrUndefined(ok('data'))).toBe('data');
      expectTypeOf(unwrapOrUndefined(ok('data'))).toEqualTypeOf<'data' | undefined>();
    });

    it('returns undefined for Err results', () => {
      expect(unwrapOrUndefined(err('error'))).toBeUndefined();
      expectTypeOf(unwrapOrUndefined(err('error'))).toEqualTypeOf<undefined>();
    });

    describe('works with different data types', () => {
      const okInput = first(ok('data'), ok({ foo: 'bar' }), err('error1'), err({ code: 404 }));
      const errInput = first(err('error1'), err({ code: 404 }), ok('data'), ok({ foo: 'bar' }));

      type StaticResult = 'data' | { readonly foo: 'bar' } | undefined;

      it('static input', () => {
        expect(unwrapOrUndefined(okInput)).toBe('data');
        expectTypeOf(unwrapOrUndefined(okInput)).toEqualTypeOf<StaticResult>();

        expect(unwrapOrUndefined(errInput)).toBeUndefined();
        expectTypeOf(() => unwrapOrUndefined(errInput)).returns.toEqualTypeOf<StaticResult>();
      });

      it('promise input', async () => {
        expect(await unwrapOrUndefined(Promise.resolve(okInput))).toBe('data');
        expectTypeOf(unwrapOrUndefined(Promise.resolve(okInput))).toEqualTypeOf<Promise<StaticResult>>();

        expect(await unwrapOrUndefined(Promise.resolve(errInput))).toBeUndefined();
        expectTypeOf(() => unwrapOrUndefined(Promise.resolve(errInput))).returns.toEqualTypeOf<Promise<StaticResult>>();
      });
    });
  });

  describe('toThrowable', () => {
    it('converts a result-returning function to a throwable one', () => {
      const okFn = toThrowable(() => first(ok('data'), err('404')));

      expect(okFn()).toBe('data');
      expectTypeOf(okFn).toEqualTypeOf<() => 'data'>();

      const errFn = toThrowable(() => first(err('404'), ok('data')));

      expect(() => errFn()).toThrow('404');
      expectTypeOf(okFn).toEqualTypeOf<() => 'data'>();
    });

    it('infers function parameters', () => {
      const divide = (a: number, b: number) => (b === 0 ? err('Division by zero') : ok(a / b));
      const fn = toThrowable(divide);

      expect(fn(1, 2)).toBe(0.5);
      expectTypeOf(fn).toEqualTypeOf<(a: number, b: number) => number>();
    });

    describe('works with different data types', () => {
      const okOutput = first(ok('data'), ok({ foo: 'bar' }), err('error'), err({ code: 404 }));
      const errOutput = first(err('error'), err({ code: 404 }), ok('data'), ok({ foo: 'bar' }));

      type StaticResult = 'data' | { readonly foo: 'bar' };

      it('static input', () => {
        const okFn = toThrowable(() => okOutput);

        expect(okFn()).toBe('data');
        expectTypeOf(okFn).toEqualTypeOf<() => StaticResult>();

        const errFn = toThrowable(() => errOutput);
        expect(() => errFn()).toThrow('error');
        expectTypeOf(errFn).toEqualTypeOf<() => StaticResult>();
      });

      it('promise input', async () => {
        const okFn = toThrowable(() => Promise.resolve(okOutput));

        expect(await okFn()).toBe('data');
        expectTypeOf(okFn).toEqualTypeOf<() => Promise<StaticResult>>();

        const errFn = toThrowable(() => Promise.resolve(errOutput));

        await expect(errFn).rejects.toBe('error');
        expectTypeOf(errFn).toEqualTypeOf<() => Promise<StaticResult>>();
      });
    });
  });

  describe('fromThrowable', () => {
    it('converts a throwable function to a result-returning one', () => {
      const fn = fromThrowable(() => {
        throw new Error('test error');
      }, 'mapped_error');

      expect(fn()).toEqual(err('mapped_error'));
      expectTypeOf(fn).toEqualTypeOf<() => Result<never, 'mapped_error'>>();
    });

    describe('for function input', () => {
      const throwable = () => {
        throw new Error('throwable error');
      };

      it('returns the value for successful functions', () => {
        const fn = fromThrowable(() => 42, 'error');

        expect(fn()).toEqual(ok(42));
        expectTypeOf(fn).toEqualTypeOf<() => Result<number, 'error'>>();
      });

      it('returns the onErr value for failed functions', () => {
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

      it('can use static value for onErr', () => {
        const fn = fromThrowable(throwable, 'error');

        expect(fn()).toEqual(err('error'));
        expectTypeOf(fn).toEqualTypeOf<() => Result<never, 'error'>>();
      });

      it('can use promise for onErr', async () => {
        const fn = fromThrowable(throwable, Promise.resolve('error' as const));

        expect(await fn()).toEqual(err('error'));
        expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<never, 'error'>>>();
      });

      it('can use function for onErr', () => {
        const fn = fromThrowable(throwable, (ex) => (ex instanceof Error ? ex.message : { error: 'unknown' }));

        expect(fn()).toEqual(err('throwable error'));
        expectTypeOf(fn).toEqualTypeOf<() => Result<never, string | { readonly error: 'unknown' }>>();
      });

      it('can use async function for onErr', async () => {
        const fn = fromThrowable(throwable, async (ex) => (ex instanceof Error ? ex.message : { error: 'unknown' }));

        expect(await fn()).toEqual(err('throwable error'));
        expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<never, string | { readonly error: 'unknown' }>>>();
      });

      it('can return ok result from onErr', () => {
        const fn = fromThrowable(throwable, () => ok('data'));

        expect(fn()).toEqual(ok('data'));
        expectTypeOf(fn).toEqualTypeOf<() => Result<'data', never>>();
      });

      it('can return mixed value types from onErr (sync)', () => {
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

      it('can return mixed value types from onErr (async)', async () => {
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
    });

    describe('for async function input', () => {
      const throwable = async () => Promise.reject(new Error('throwable error'));

      it('returns the value for successful async functions', async () => {
        const fn = fromThrowable(async () => Promise.resolve(42), 'error');

        expect(await fn()).toEqual(ok(42));
        expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<number, 'error'>>>();
      });

      it('returns the onErr value for failed async functions', async () => {
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

      it('can use static value for onErr', async () => {
        const fn = fromThrowable(throwable, 'error');

        expect(await fn()).toEqual(err('error'));
        expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<never, 'error'>>>();
      });

      it('can use promise for onErr', async () => {
        const fn = fromThrowable(throwable, Promise.resolve('error' as const));

        expect(await fn()).toEqual(err('error'));
        expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<never, 'error'>>>();
      });

      it('can use function for onErr', async () => {
        const fn = fromThrowable(throwable, (ex) => (ex instanceof Error ? ex.message : { error: 'unknown' }));

        expect(await fn()).toEqual(err('throwable error'));
        expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<never, string | { readonly error: 'unknown' }>>>();
      });

      it('can use async function for onErr', async () => {
        const fn = fromThrowable(throwable, async (ex) => (ex instanceof Error ? ex.message : { error: 'unknown' }));

        expect(await fn()).toEqual(err('throwable error'));
        expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<never, string | { readonly error: 'unknown' }>>>();
      });

      it('can return an ok result', async () => {
        const fn = fromThrowable(throwable, () => ok('data'));

        expect(await fn()).toEqual(ok('data'));
        expectTypeOf(fn).toEqualTypeOf<() => Promise<Result<'data', never>>>();
      });

      it('can return mixed value types from onErr (sync)', async () => {
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

      it('can return mixed value types from onErr (async)', async () => {
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
    });
  });

  describe('tryCatch', () => {
    describe('creates a result-returning boundary around a', () => {
      it('rejected promise', async () => {
        const result = tryCatch(Promise.reject(new Error('test error')), 'caught error');

        expect(await result).toEqual(err('caught error'));
        expectTypeOf(result).toEqualTypeOf<Promise<Result<never, 'caught error'>>>();
      });

      it('throwable function', () => {
        const result = tryCatch(() => {
          throw new Error('test error');
        }, 'caught error');

        expect(result).toEqual(err('caught error'));
        expectTypeOf(result).toEqualTypeOf<Result<never, 'caught error'>>();
      });

      it('throwable async function', async () => {
        const result = tryCatch(async () => {
          throw new Error('test error');
        }, 'caught error');

        expect(await result).toEqual(err('caught error'));
        expectTypeOf(result).toEqualTypeOf<Promise<Result<never, 'caught error'>>>();
      });
    });

    describe('returns ok result for', () => {
      it('resolved promise', async () => {
        const result = tryCatch(Promise.resolve(42), 'caught error');

        expect(await result).toEqual(ok(42));
        expectTypeOf(result).toEqualTypeOf<Promise<Result<number, 'caught error'>>>();
      });

      it('non-throwing function', () => {
        const result = tryCatch(() => 42, 'caught error');

        expect(result).toEqual(ok(42));
        expectTypeOf(result).toEqualTypeOf<Result<number, 'caught error'>>();
      });

      it('non-throwing async function', async () => {
        const result = tryCatch(async () => 42, 'caught error');

        expect(await result).toEqual(ok(42));
        expectTypeOf(result).toEqualTypeOf<Promise<Result<number, 'caught error'>>>();
      });
    });

    describe('extends success response when ok result is returned from onCatch', () => {
      const throwable = () => {
        throw new Error('throwable error');
      };

      it('in sync function', () => {
        const result = tryCatch(throwable, () => ok('data'));

        expect(result).toEqual(ok('data'));
        expectTypeOf(result).toEqualTypeOf<Result<'data', never>>();
      });

      it('in async function', async () => {
        const result = tryCatch(throwable, async () => ok('data'));

        expect(await result).toEqual(ok('data'));
        expectTypeOf(result).toEqualTypeOf<Promise<Result<'data', never>>>();
      });
    });

    describe('works for different data types', () => {
      const staticOnCatch = 'caught error' as const;
      const fnOnCatch = (ex: unknown) => (ex instanceof Error ? { error: ex.message } : 'caught error');
      const asyncFnOnCatch = async (ex: unknown) => (ex instanceof Error ? { error: ex.message } : 'caught error');

      type StaticResult = Result<42 | { foo: string }, 'caught error'>;
      type FnResult = Result<42 | { foo: string }, 'caught error' | { error: string }>;

      describe('promise as onTry', () => {
        const promise = () =>
          first(Promise.reject(new Error('test error')), Promise.resolve(42 as const), Promise.resolve({ foo: 'bar' }));

        it('static value for onCatch', async () => {
          const result = tryCatch(promise(), staticOnCatch);

          expect(await result).toEqual(err('caught error'));
          expectTypeOf(result).toEqualTypeOf<Promise<StaticResult>>();
        });

        it('promise for onCatch', async () => {
          const result = tryCatch(promise(), Promise.resolve(staticOnCatch));

          expect(await result).toEqual(err('caught error'));
          expectTypeOf(result).toEqualTypeOf<Promise<StaticResult>>();
        });

        it('function for onCatch', async () => {
          const result = tryCatch(promise(), fnOnCatch);

          expect(await result).toEqual(err({ error: 'test error' }));
          expectTypeOf(result).toEqualTypeOf<Promise<FnResult>>();
        });

        it('async function for onCatch', async () => {
          const result = tryCatch(promise(), asyncFnOnCatch);

          expect(await result).toEqual(err({ error: 'test error' }));
          expectTypeOf(result).toEqualTypeOf<Promise<FnResult>>();
        });
      });

      describe('function as onTry', () => {
        const fn = () => {
          if (Math.random() > -1) {
            throw new Error('test error');
          }
          return Math.random() > 1 ? 42 : { foo: 'bar' };
        };

        it('static value for onCatch', () => {
          const result = tryCatch(fn, staticOnCatch);

          expect(result).toEqual(err('caught error'));
          expectTypeOf(result).toEqualTypeOf<StaticResult>();
        });

        it('promise for onCatch', async () => {
          const result = tryCatch(fn, Promise.resolve(staticOnCatch));

          expect(await result).toEqual(err('caught error'));
          expectTypeOf(result).toEqualTypeOf<Promise<StaticResult>>();
        });

        it('function for onCatch', () => {
          const result = tryCatch(fn, fnOnCatch);

          expect(result).toEqual(err({ error: 'test error' }));
          expectTypeOf(result).toEqualTypeOf<FnResult>();
        });

        it('async function for onCatch', async () => {
          const result = tryCatch(fn, asyncFnOnCatch);

          expect(await result).toEqual(err({ error: 'test error' }));
          expectTypeOf(result).toEqualTypeOf<Promise<FnResult>>();
        });
      });

      describe('async function as onTry', () => {
        const asyncFn = async () => {
          if (Math.random() > -1) {
            throw new Error('test error');
          }
          return Math.random() > 1 ? 42 : { foo: 'bar' };
        };

        it('static value for onCatch', async () => {
          const result = tryCatch(asyncFn, staticOnCatch);

          expect(await result).toEqual(err('caught error'));
          expectTypeOf(result).toEqualTypeOf<Promise<StaticResult>>();
        });

        it('promise for onCatch', async () => {
          const result = tryCatch(asyncFn, Promise.resolve(staticOnCatch));

          expect(await result).toEqual(err('caught error'));
          expectTypeOf(result).toEqualTypeOf<Promise<StaticResult>>();
        });

        it('function for onCatch', async () => {
          const result = tryCatch(asyncFn, fnOnCatch);

          expect(await result).toEqual(err({ error: 'test error' }));
          expectTypeOf(result).toEqualTypeOf<Promise<FnResult>>();
        });

        it('async function for onCatch', async () => {
          const result = tryCatch(asyncFn, asyncFnOnCatch);

          expect(await result).toEqual(err({ error: 'test error' }));
          expectTypeOf(result).toEqualTypeOf<Promise<FnResult>>();
        });
      });
    });

    describe('allows to return mixed value types from onCatch', () => {
      const throwable = () => {
        throw new Error('throwable error');
      };

      it('sync function', () => {
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

      it('async function', async () => {
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

    it('allows to change type of the success value', () => {
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

    describe('works with different data types', () => {
      it('static input, function mapper', () => {
        const output = mapOk(ok(1), (data) =>
          mapOk(data ? ok(data * 2) : err('error'), (data) => (data ? Boolean(data > 1) : err({ error: data }))),
        );

        expect(output).toEqual(ok(true));
        expectTypeOf(output).toEqualTypeOf<Result<boolean, 'error' | { readonly error: number }>>();
      });

      it('static input, async function mapper', async () => {
        const output = mapOk(ok(1), async (x) =>
          mapOk(await (x ? ok(x * 2) : err('error')), async (y) => (y ? Boolean(y > 1) : err({ error: y }))),
        );

        expect(await output).toEqual(ok(true));
        expectTypeOf(output).toEqualTypeOf<Promise<Result<boolean, 'error' | { readonly error: number }>>>();
      });

      it('static input, mixed function mapper', async () => {
        const output = mapOk(ok(1), async (data) =>
          mapOk(data ? ok(data * 2) : err('error'), (data) => (data ? Boolean(data > 1) : err({ error: data }))),
        );

        expect(await output).toEqual(ok(true));
        expectTypeOf(output).toEqualTypeOf<Promise<Result<boolean, 'error' | { readonly error: number }>>>();
      });

      it('promise input, function mapper', async () => {
        const output = mapOk(Promise.resolve(ok(1)), (data) =>
          mapOk(data ? ok(data * 2) : err('error'), (data) => (data ? Boolean(data > 1) : err({ error: data }))),
        );

        expect(await output).toEqual(ok(true));
        expectTypeOf(output).toEqualTypeOf<Promise<Result<boolean, 'error' | { readonly error: number }>>>();
      });

      it('promise input, async function mapper', async () => {
        const output = mapOk(Promise.resolve(ok(1)), async (data) =>
          mapOk(data ? ok(data * 2) : err('error'), async (data) => (data ? Boolean(data > 1) : err({ error: data }))),
        );

        expect(await output).toEqual(ok(true));
        expectTypeOf(output).toEqualTypeOf<Promise<Result<boolean, 'error' | { readonly error: number }>>>();
      });

      it('promise input, mixed function mapper', async () => {
        const output = mapOk(Promise.resolve(ok(1)), async (data) =>
          mapOk(data ? ok(data * 2) : err('error'), (data) => (data ? Boolean(data > 1) : err({ error: data }))),
        );

        expect(await output).toEqual(ok(true));
        expectTypeOf(output).toEqualTypeOf<Promise<Result<boolean, 'error' | { readonly error: number }>>>();
      });
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

    it('allows to change type of the error value', () => {
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

    describe('works with different data types', () => {
      it('static input, function mapper', () => {
        const output = mapErr(err(1), (error) =>
          mapErr(error ? err(error * 2) : ok('success'), (error) => (error ? Boolean(error > 1) : err({ error }))),
        );

        expect(output).toEqual(err(true));
        expectTypeOf(output).toEqualTypeOf<Result<'success', boolean | { readonly error: number }>>();
      });

      it('static input, async function mapper', async () => {
        const output = mapErr(err(1), async (error) =>
          mapErr(error ? err(error * 2) : ok('success'), async (error) =>
            error ? Boolean(error > 1) : err({ error }),
          ),
        );

        expect(await output).toEqual(err(true));
        expectTypeOf(output).toEqualTypeOf<Promise<Result<'success', boolean | { readonly error: number }>>>();
      });

      it('static input, mixed function mapper', async () => {
        const output = mapErr(err(1), async (error) =>
          mapErr(error ? err(error * 2) : ok('success'), (error) => (error ? Boolean(error > 1) : err({ error }))),
        );

        expect(await output).toEqual(err(true));
        expectTypeOf(output).toEqualTypeOf<Promise<Result<'success', boolean | { readonly error: number }>>>();
      });

      it('promise input, function mapper', async () => {
        const output = mapErr(Promise.resolve(err(1)), (error) =>
          mapErr(error ? err(error * 2) : ok('success'), (error) => (error ? Boolean(error > 1) : err({ error }))),
        );

        expect(await output).toEqual(err(true));
        expectTypeOf(output).toEqualTypeOf<Promise<Result<'success', boolean | { readonly error: number }>>>();
      });

      it('promise input, async function mapper', async () => {
        const output = mapErr(Promise.resolve(err(1)), async (error) =>
          mapErr(error ? err(error * 2) : ok('success'), async (error) =>
            error ? Boolean(error > 1) : err({ error }),
          ),
        );

        expect(await output).toEqual(err(true));
        expectTypeOf(output).toEqualTypeOf<Promise<Result<'success', boolean | { readonly error: number }>>>();
      });

      it('promise input, mixed function mapper', async () => {
        const output = mapErr(Promise.resolve(err(1)), async (error) =>
          mapErr(error ? err(error * 2) : ok('success'), (error) => (error ? Boolean(error > 1) : err({ error }))),
        );

        expect(await output).toEqual(err(true));
        expectTypeOf(output).toEqualTypeOf<Promise<Result<'success', boolean | { readonly error: number }>>>();
      });
    });
  });

  describe('match', () => {
    it('invokes the onOk function for Ok results', () => {
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

    it('invokes the onErr function for Err results', () => {
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

    describe('works with different data types', () => {
      describe('static input', () => {
        const okInput = first(ok('success'), err('error'));
        const errInput = first(err('error'), ok('success'));

        it('function onOk, function onErr', () => {
          const okOutput = match(
            okInput,
            (data) => ({ data }),
            (error) => ({ error }),
          );

          expect(okOutput).toEqual({ data: 'success' });
          expectTypeOf(okOutput).toEqualTypeOf<Readonly<{ data: 'success' } | { error: 'error' }>>();

          const errOutput = match(
            errInput,
            (data) => ({ data }),
            (error) => ({ error }),
          );
          expect(errOutput).toEqual({ error: 'error' });
          expectTypeOf(errOutput).toEqualTypeOf<Readonly<{ data: 'success' } | { error: 'error' }>>();
        });

        it('function onOk, async function onErr', async () => {
          const okOutput = match(
            okInput,
            (data) => ({ data }),
            async (error) => ({ error }),
          );

          expect(await okOutput).toEqual({ data: 'success' });
          expectTypeOf(okOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();

          const errOutput = match(
            errInput,
            (data) => ({ data }),
            async (error) => ({ error }),
          );
          expect(await errOutput).toEqual({ error: 'error' });
          expectTypeOf(errOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();
        });

        it('function onOk, static onErr', () => {
          const okOutput = match(okInput, (data) => ({ data }), 'some_error');

          expect(okOutput).toEqual({ data: 'success' });
          expectTypeOf(okOutput).toEqualTypeOf<{ readonly data: 'success' } | 'some_error'>();

          const errOutput = match(errInput, (data) => ({ data }), 'some_error');
          expect(errOutput).toEqual('some_error');
          expectTypeOf(errOutput).toEqualTypeOf<{ readonly data: 'success' } | 'some_error'>();
        });

        it('function onOk, promise onErr', async () => {
          const okOutput = match(okInput, (data) => ({ data }), Promise.resolve('some_error' as const));

          expect(await okOutput).toEqual({ data: 'success' });
          expectTypeOf(okOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();

          const errOutput = match(errInput, (data) => ({ data }), Promise.resolve('some_error' as const));
          expect(await errOutput).toEqual('some_error');
          expectTypeOf(errOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();
        });

        it('async function onOk, function onErr', async () => {
          const okOutput = match(
            okInput,
            async (data) => ({ data }),
            (error) => ({ error }),
          );

          expect(await okOutput).toEqual({ data: 'success' });
          expectTypeOf(okOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();

          const errOutput = match(
            errInput,
            async (data) => ({ data }),
            (error) => ({ error }),
          );
          expect(await errOutput).toEqual({ error: 'error' });
          expectTypeOf(errOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();
        });

        it('async function onOk, async function onErr', async () => {
          const okOutput = match(
            okInput,
            async (data) => ({ data }),
            async (error) => ({ error }),
          );

          expect(await okOutput).toEqual({ data: 'success' });
          expectTypeOf(okOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();

          const errOutput = match(
            errInput,
            async (data) => ({ data }),
            async (error) => ({ error }),
          );
          expect(await errOutput).toEqual({ error: 'error' });
          expectTypeOf(errOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();
        });

        it('async function onOk, static onErr', async () => {
          const okOutput = match(okInput, async (data) => ({ data }), 'some_error');

          expect(await okOutput).toEqual({ data: 'success' });
          expectTypeOf(okOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();

          const errOutput = match(errInput, async (data) => ({ data }), 'some_error');
          expect(await errOutput).toEqual('some_error');
          expectTypeOf(errOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();
        });

        it('async function onOk, promise onErr', async () => {
          const okOutput = match(okInput, async (data) => ({ data }), Promise.resolve('some_error' as const));

          expect(await okOutput).toEqual({ data: 'success' });
          expectTypeOf(okOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();

          const errOutput = match(errInput, async (data) => ({ data }), Promise.resolve('some_error' as const));
          expect(await errOutput).toEqual('some_error');
          expectTypeOf(errOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();
        });

        it('static onOk, function onErr', () => {
          const okOutput = match(okInput, 'some_success', (error) => ({ error }));

          expect(okOutput).toEqual('some_success');
          expectTypeOf(okOutput).toEqualTypeOf<'some_success' | { readonly error: 'error' }>();

          const errOutput = match(errInput, 'some_success', (error) => ({ error }));
          expect(errOutput).toEqual({ error: 'error' });
          expectTypeOf(errOutput).toEqualTypeOf<'some_success' | { readonly error: 'error' }>();
        });

        it('static onOk, async function onErr', async () => {
          const okOutput = match(okInput, 'some_success', async (error) => ({ error }));

          expect(await okOutput).toEqual('some_success');
          expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();

          const errOutput = match(errInput, 'some_success', async (error) => ({
            error,
          }));
          expect(await errOutput).toEqual({ error: 'error' });
          expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();
        });

        it('static onOk, static onErr', () => {
          const okOutput = match(okInput, 'some_success', 'some_error');

          expect(okOutput).toEqual('some_success');
          expectTypeOf(okOutput).toEqualTypeOf<'some_success' | 'some_error'>();

          const errOutput = match(errInput, 'some_success', 'some_error');
          expect(errOutput).toEqual('some_error');
          expectTypeOf(errOutput).toEqualTypeOf<'some_success' | 'some_error'>();
        });

        it('static onOk, promise onErr', async () => {
          const okOutput = match(okInput, 'some_success', Promise.resolve('some_error' as const));

          expect(await okOutput).toEqual('some_success');
          expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();

          const errOutput = match(errInput, 'some_success', Promise.resolve('some_error' as const));
          expect(await errOutput).toEqual('some_error');
          expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();
        });

        it('promise onOk, function onErr', async () => {
          const okOutput = match(okInput, Promise.resolve('some_success' as const), (error) => ({ error }));

          expect(await okOutput).toEqual('some_success');
          expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();

          const errOutput = match(errInput, Promise.resolve('some_success' as const), (error) => ({ error }));
          expect(await errOutput).toEqual({ error: 'error' });
          expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();
        });

        it('promise onOk, async function onErr', async () => {
          const okOutput = match(okInput, Promise.resolve('some_success' as const), async (error) => ({
            error,
          }));

          expect(await okOutput).toEqual('some_success');
          expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();

          const errOutput = match(errInput, Promise.resolve('some_success' as const), async (error) => ({
            error,
          }));
          expect(await errOutput).toEqual({ error: 'error' });
          expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();
        });

        it('promise onOk, static onErr', async () => {
          const okOutput = match(okInput, Promise.resolve('some_success' as const), 'some_error');

          expect(await okOutput).toEqual('some_success');
          expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();

          const errOutput = match(errInput, Promise.resolve('some_success' as const), 'some_error');
          expect(await errOutput).toEqual('some_error');
          expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();
        });

        it('promise onOk, promise onErr', async () => {
          const okOutput = match(
            okInput,
            Promise.resolve('some_success' as const),
            Promise.resolve('some_error' as const),
          );

          expect(await okOutput).toEqual('some_success');
          expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();

          const errOutput = match(
            errInput,
            Promise.resolve('some_success' as const),
            Promise.resolve('some_error' as const),
          );
          expect(await errOutput).toEqual('some_error');
          expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();
        });
      });

      describe('promise input', () => {
        const okInput = Promise.resolve(first(ok('success'), err('error')));
        const errInput = Promise.resolve(first(err('error'), ok('success')));

        it('function onOk, function onErr', async () => {
          const okOutput = match(
            okInput,
            (data) => ({ data }),
            (error) => ({ error }),
          );

          expect(await okOutput).toEqual({ data: 'success' });
          expectTypeOf(okOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();

          const errOutput = match(
            errInput,
            (data) => ({ data }),
            (error) => ({ error }),
          );
          expect(await errOutput).toEqual({ error: 'error' });
          expectTypeOf(errOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();
        });

        it('function onOk, async function onErr', async () => {
          const okOutput = match(
            okInput,
            (data) => ({ data }),
            async (error) => ({ error }),
          );

          expect(await okOutput).toEqual({ data: 'success' });
          expectTypeOf(okOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();

          const errOutput = match(
            errInput,
            (data) => ({ data }),
            async (error) => ({ error }),
          );
          expect(await errOutput).toEqual({ error: 'error' });
          expectTypeOf(errOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();
        });

        it('function onOk, static onErr', async () => {
          const okOutput = match(okInput, (data) => ({ data }), 'some_error');

          expect(await okOutput).toEqual({ data: 'success' });
          expectTypeOf(okOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();

          const errOutput = match(errInput, (data) => ({ data }), 'some_error');
          expect(await errOutput).toEqual('some_error');
          expectTypeOf(errOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();
        });

        it('function onOk, promise onErr', async () => {
          const okOutput = match(okInput, (data) => ({ data }), Promise.resolve('some_error' as const));

          expect(await okOutput).toEqual({ data: 'success' });
          expectTypeOf(okOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();

          const errOutput = match(errInput, (data) => ({ data }), Promise.resolve('some_error' as const));
          expect(await errOutput).toEqual('some_error');
          expectTypeOf(errOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();
        });

        it('async function onOk, function onErr', async () => {
          const okOutput = match(
            okInput,
            async (data) => ({ data }),
            (error) => ({ error }),
          );

          expect(await okOutput).toEqual({ data: 'success' });
          expectTypeOf(okOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();

          const errOutput = match(
            errInput,
            async (data) => ({ data }),
            (error) => ({ error }),
          );
          expect(await errOutput).toEqual({ error: 'error' });
          expectTypeOf(errOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();
        });

        it('async function onOk, async function onErr', async () => {
          const okOutput = match(
            okInput,
            async (data) => ({ data }),
            async (error) => ({ error }),
          );

          expect(await okOutput).toEqual({ data: 'success' });
          expectTypeOf(okOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();

          const errOutput = match(
            errInput,
            async (data) => ({ data }),
            async (error) => ({ error }),
          );
          expect(await errOutput).toEqual({ error: 'error' });
          expectTypeOf(errOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();
        });

        it('async function onOk, static onErr', async () => {
          const okOutput = match(okInput, async (data) => ({ data }), 'some_error');

          expect(await okOutput).toEqual({ data: 'success' });
          expectTypeOf(okOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();

          const errOutput = match(errInput, async (data) => ({ data }), 'some_error');
          expect(await errOutput).toEqual('some_error');
          expectTypeOf(errOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();
        });

        it('async function onOk, promise onErr', async () => {
          const okOutput = match(okInput, async (data) => ({ data }), Promise.resolve('some_error' as const));

          expect(await okOutput).toEqual({ data: 'success' });
          expectTypeOf(okOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();

          const errOutput = match(errInput, async (data) => ({ data }), Promise.resolve('some_error' as const));
          expect(await errOutput).toEqual('some_error');
          expectTypeOf(errOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();
        });

        it('static onOk, function onErr', async () => {
          const okOutput = match(okInput, 'some_success', (error) => ({ error }));

          expect(await okOutput).toEqual('some_success');
          expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();

          const errOutput = match(errInput, 'some_success', (error) => ({ error }));
          expect(await errOutput).toEqual({ error: 'error' });
          expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();
        });

        it('static onOk, async function onErr', async () => {
          const okOutput = match(okInput, 'some_success', async (error) => ({ error }));

          expect(await okOutput).toEqual('some_success');
          expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();

          const errOutput = match(errInput, 'some_success', async (error) => ({
            error,
          }));
          expect(await errOutput).toEqual({ error: 'error' });
          expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();
        });

        it('static onOk, static onErr', async () => {
          const okOutput = match(okInput, 'some_success', 'some_error');

          expect(await okOutput).toEqual('some_success');
          expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();

          const errOutput = match(errInput, 'some_success', 'some_error');
          expect(await errOutput).toEqual('some_error');
          expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();
        });

        it('static onOk, promise onErr', async () => {
          const okOutput = match(okInput, 'some_success', Promise.resolve('some_error' as const));

          expect(await okOutput).toEqual('some_success');
          expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();

          const errOutput = match(errInput, 'some_success', Promise.resolve('some_error' as const));
          expect(await errOutput).toEqual('some_error');
          expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();
        });

        it('promise onOk, function onErr', async () => {
          const okOutput = match(okInput, Promise.resolve('some_success' as const), (error) => ({ error }));

          expect(await okOutput).toEqual('some_success');
          expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();

          const errOutput = match(errInput, Promise.resolve('some_success' as const), (error) => ({ error }));
          expect(await errOutput).toEqual({ error: 'error' });
          expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();
        });

        it('promise onOk, async function onErr', async () => {
          const okOutput = match(okInput, Promise.resolve('some_success' as const), async (error) => ({
            error,
          }));

          expect(await okOutput).toEqual('some_success');
          expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();

          const errOutput = match(errInput, Promise.resolve('some_success' as const), async (error) => ({
            error,
          }));
          expect(await errOutput).toEqual({ error: 'error' });
          expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();
        });

        it('promise onOk, static onErr', async () => {
          const okOutput = match(okInput, Promise.resolve('some_success' as const), 'some_error');

          expect(await okOutput).toEqual('some_success');
          expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();

          const errOutput = match(errInput, Promise.resolve('some_success' as const), 'some_error');
          expect(await errOutput).toEqual('some_error');
          expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();
        });

        it('promise onOk, promise onErr', async () => {
          const okOutput = match(
            okInput,
            Promise.resolve('some_success' as const),
            Promise.resolve('some_error' as const),
          );

          expect(await okOutput).toEqual('some_success');
          expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();

          const errOutput = match(
            errInput,
            Promise.resolve('some_success' as const),
            Promise.resolve('some_error' as const),
          );
          expect(await errOutput).toEqual('some_error');
          expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();
        });
      });
    });
  });

  describe('toTuple', () => {
    const okResult = first(ok(1), ok({ foo: 'bar' }), err('a'), err({ status: 404 }));
    const errResult = first(err('a'), err({ status: 404 }), ok(1), ok({ foo: 'bar' }));

    it('works with ok results', () => {
      const [data, error] = toTuple(okResult);

      expect(data).toBe(1);
      expect(error).toBeUndefined();
    });

    it('works with err results', () => {
      const [data, error] = toTuple(errResult);

      expect(data).toBeUndefined();
      expect(error).toBe('a');
    });

    it('works with ok promise results', async () => {
      const [data, error] = await toTuple(Promise.resolve(okResult));

      expect(data).toBe(1);
      expect(error).toBeUndefined();
    });

    it('works with err promise results', async () => {
      const [data, error] = await toTuple(Promise.resolve(errResult));

      expect(data).toBeUndefined();
      expect(error).toBe('a');
    });

    it('infers data and error types correctly (sync)', () => {
      const [data, error] = toTuple(okResult);

      expectTypeOf(data).toEqualTypeOf<1 | { readonly foo: 'bar' } | undefined>();
      expectTypeOf(error).toEqualTypeOf<'a' | { readonly status: 404 } | undefined>();

      if (!error) {
        expectTypeOf(data).toEqualTypeOf<1 | { readonly foo: 'bar' }>();
      }

      if (!data) {
        expectTypeOf(error).toEqualTypeOf<'a' | { readonly status: 404 }>();
      }
    });

    it('infers data and error types correctly (async)', async () => {
      const tuple = toTuple(Promise.resolve(okResult));

      expectTypeOf(tuple).toExtend<Promise<unknown>>();

      const [data, error] = await tuple;

      expectTypeOf(data).toEqualTypeOf<1 | { readonly foo: 'bar' } | undefined>();
      expectTypeOf(error).toEqualTypeOf<'a' | { readonly status: 404 } | undefined>();

      if (!error) {
        expectTypeOf(data).toEqualTypeOf<1 | { readonly foo: 'bar' }>();
      }

      if (!data) {
        expectTypeOf(error).toEqualTypeOf<'a' | { readonly status: 404 }>();
      }
    });
  });
});
