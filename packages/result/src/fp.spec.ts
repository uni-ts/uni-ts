import { pipe } from '@uni-ts/composition';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { mapErr, mapOk, match, unwrapOr } from './fp.js';
import { first } from './helpers.js';
import type { Result } from './index.js';
import { err, ok } from './index.js';

describe('fp.ts', () => {
  describe('unwrapOr', () => {
    it('allows composition', async () => {
      expect(pipe(ok('data'), unwrapOr('default'))).toBe('data');
      expectTypeOf(pipe(ok('data'), unwrapOr('default'))).toEqualTypeOf<'data' | 'default'>();

      expect(pipe(err('error'), unwrapOr('default'))).toBe('default');
      expectTypeOf(pipe(err('error'), unwrapOr('default'))).toEqualTypeOf<'default'>();

      expect(await pipe(ok('data'), async (r) => r, unwrapOr('default'))).toBe('data');
      expectTypeOf(pipe(ok('data'), async (r) => r, unwrapOr('default'))).toEqualTypeOf<Promise<'data' | 'default'>>();

      expect(await pipe(err('error'), async (r) => r, unwrapOr('default'))).toBe('default');
      expectTypeOf(pipe(err('error'), async (r) => r, unwrapOr('default'))).toEqualTypeOf<Promise<'default'>>();
    });
  });

  describe('mapOk', () => {
    it('allows composition', async () => {
      const sync = pipe(
        ok(1),
        mapOk((data) => (data ? ok(data * 2) : err('error1'))),
        mapOk((data) => (data ? Boolean(data > 1) : err({ error: data }))),
      );
      expect(sync).toEqual(ok(true));
      expectTypeOf(sync).toEqualTypeOf<Result<boolean, 'error1' | { readonly error: number }>>();

      const async = pipe(
        ok(1),
        mapOk(async (data) => (data ? ok(data * 2) : err('error1'))),
        mapOk((data) => (data ? Boolean(data > 1) : err({ error: data }))),
      );
      expect(await async).toEqual(ok(true));
      expectTypeOf(async).toEqualTypeOf<Promise<Result<boolean, 'error1' | { readonly error: number }>>>();
    });
  });

  describe('mapErr', () => {
    it('allows composition', async () => {
      const sync = pipe(
        err(404),
        mapErr((error) => (error === 404 ? err({ code: 404 }) : ok(null))),
        mapErr((error) => (error.code ? 'not-found' : ok({ data: 'success' }))),
      );
      expect(sync).toEqual(err('not-found'));
      expectTypeOf(sync).toEqualTypeOf<Result<{ readonly data: 'success' } | null, 'not-found'>>();

      const async = pipe(
        err(404),
        mapErr(async (error) => (error === 404 ? err({ code: 404 }) : ok(null))),
        mapErr((error) => (error.code ? 'not-found' : ok({ data: 'success' }))),
      );
      expect(await async).toEqual(err('not-found'));
      expectTypeOf(async).toEqualTypeOf<Promise<Result<{ readonly data: 'success' } | null, 'not-found'>>>();
    });
  });

  describe('match', () => {
    it('allows composition', async () => {
      const sync = pipe(
        first(ok('ok'), err('error')),
        match(
          (data) => (data ? { data } : 'negative_value'),
          (error) => (error ? { error } : 'unknown_error'),
        ),
      );
      expect(sync).toEqual({ data: 'ok' });
      expectTypeOf(sync).toEqualTypeOf<
        { readonly data: 'ok' } | 'negative_value' | { readonly error: 'error' } | 'unknown_error'
      >();

      const async = pipe(
        Promise.resolve(first(ok('ok'), err('error'))),
        match(
          (data) => (data ? { data } : 'negative_value'),
          (error) => (error ? { error } : 'unknown_error'),
        ),
      );
      expect(await async).toEqual({ data: 'ok' });
      expectTypeOf(async).toEqualTypeOf<
        Promise<{ readonly data: 'ok' } | 'negative_value' | { readonly error: 'error' } | 'unknown_error'>
      >();
    });
  });
});
