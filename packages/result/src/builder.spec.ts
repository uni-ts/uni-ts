import { describe, expect, expectTypeOf, it } from 'vitest';
import { result } from './builder.js';
import { first } from './helpers.js';
import type { Result } from './index.js';
import { err, ok } from './index.js';

describe('builder.ts', () => {
  describe('result', () => {
    it('works with static input', () => {
      const output = result(ok(1))
        .mapOk((data) => (data ? ok(data * 2) : err('error')))
        .create();
      expect(output).toEqual(ok(2));
      expectTypeOf(output).toEqualTypeOf<Result<number, 'error'>>();
    });

    it('works with promise input', async () => {
      const output = result(Promise.resolve(ok(1)))
        .mapOk((data) => (data ? ok(data * 2) : err('error')))
        .create();
      expect(await output).toEqual(ok(2));
      expectTypeOf(output).toEqualTypeOf<Promise<Result<number, 'error'>>>();
    });

    it('works with function input', () => {
      const fn = result((data: number) => (data > 0 ? ok(data) : err('negative')))
        .mapOk((data) => (data ? ok(data * 2) : err('error')))
        .create();
      expect(fn(1)).toEqual(ok(2));
      expectTypeOf(fn).toEqualTypeOf<(x: number) => Result<number, 'negative' | 'error'>>();
    });

    it('works with async function input', async () => {
      const fn = result(async (data: number) => (data > 0 ? ok(data) : err('negative')))
        .mapOk((data) => (data ? ok(data * 2) : err('error')))
        .create();
      expect(await fn(1)).toEqual(ok(2));
      expectTypeOf(fn).toEqualTypeOf<(x: number) => Promise<Result<number, 'negative' | 'error'>>>();
    });
  });

  describe('mapOk', () => {
    it('static input, function mapper', () => {
      const output = result(ok(1))
        .mapOk((data) => (data ? ok(data * 2) : err('error')))
        .mapOk((data) => (data ? Boolean(data > 1) : err({ error: data })))
        .create();

      expect(output).toEqual(ok(true));
      expectTypeOf(output).toEqualTypeOf<Result<boolean, 'error' | { readonly error: number }>>();
    });

    it('static input, async function mapper', async () => {
      const output = result(ok(1))
        .mapOk(async (data) => (data ? ok(data * 2) : err('error')))
        .mapOk(async (data) => (data ? Boolean(data > 1) : err({ error: data })))
        .create();

      expect(await output).toEqual(ok(true));
      expectTypeOf(output).toEqualTypeOf<Promise<Result<boolean, 'error' | { readonly error: number }>>>();
    });

    it('static input, mixed function mapper', async () => {
      const output = result(ok(1))
        .mapOk(async (data) => (data ? ok(data * 2) : err('error')))
        .mapOk((data) => (data ? Boolean(data > 1) : err({ error: data })))
        .create();

      expect(await output).toEqual(ok(true));
      expectTypeOf(output).toEqualTypeOf<Promise<Result<boolean, 'error' | { readonly error: number }>>>();
    });

    it('promise input, function mapper', async () => {
      const output = result(Promise.resolve(ok(1)))
        .mapOk((data) => (data ? ok(data * 2) : err('error')))
        .mapOk((data) => (data ? Boolean(data > 1) : err({ error: data })))
        .create();

      expect(await output).toEqual(ok(true));
      expectTypeOf(output).toEqualTypeOf<Promise<Result<boolean, 'error' | { readonly error: number }>>>();
    });

    it('promise input, async function mapper', async () => {
      const output = result(Promise.resolve(ok(1)))
        .mapOk(async (data) => (data ? ok(data * 2) : err('error')))
        .mapOk(async (data) => (data ? Boolean(data > 1) : err({ error: data })))
        .create();

      expect(await output).toEqual(ok(true));
      expectTypeOf(output).toEqualTypeOf<Promise<Result<boolean, 'error' | { readonly error: number }>>>();
    });

    it('promise input, mixed function mapper', async () => {
      const output = result(Promise.resolve(ok(1)))
        .mapOk(async (data) => (data ? ok(data * 2) : err('error')))
        .mapOk((data) => (data ? Boolean(data > 1) : err({ error: data })))
        .create();

      expect(await output).toEqual(ok(true));
      expectTypeOf(output).toEqualTypeOf<Promise<Result<boolean, 'error' | { readonly error: number }>>>();
    });

    it('function input, function mapper', () => {
      const fn = result((data: number) => (data ? ok(data * 2) : err('error')))
        .mapOk((data) => (data ? Boolean(data > 1) : err({ error: data })))
        .create();

      expect(fn(1)).toEqual(ok(true));
      expectTypeOf(fn).toEqualTypeOf<(x: number) => Result<boolean, 'error' | { readonly error: number }>>();
    });

    it('function input, async function mapper', async () => {
      const fn = result((data: number) => (data ? ok(data * 2) : err('error')))
        .mapOk(async (data) => (data ? Boolean(data > 1) : err({ error: data })))
        .create();

      expect(await fn(1)).toEqual(ok(true));
      expectTypeOf(fn).toEqualTypeOf<(x: number) => Promise<Result<boolean, 'error' | { readonly error: number }>>>();
    });

    it('function input, mixed function mapper', async () => {
      const fn = result((data: number) => (data ? ok(data * 2) : err('error')))
        .mapOk(async (data) => (data ? Boolean(data > 1) : err({ error: data })))
        .mapOk((data) => ({ data }))
        .create();

      expect(await fn(1)).toEqual(ok({ data: true }));
      expectTypeOf(fn).toEqualTypeOf<
        (x: number) => Promise<Result<{ readonly data: boolean }, 'error' | { readonly error: number }>>
      >();
    });

    it('async function input, function mapper', async () => {
      const fn = result(async (data: number) => (data ? ok(data * 2) : err('error')))
        .mapOk((data) => (data ? Boolean(data > 1) : err({ error: data })))
        .create();

      expect(await fn(1)).toEqual(ok(true));
      expectTypeOf(fn).toEqualTypeOf<(x: number) => Promise<Result<boolean, 'error' | { readonly error: number }>>>();
    });

    it('async function input, async function mapper', async () => {
      const fn = result(async (data: number) => (data ? ok(data * 2) : err('error')))
        .mapOk(async (data) => (data ? Boolean(data > 1) : err({ error: data })))
        .create();

      expect(await fn(1)).toEqual(ok(true));
      expectTypeOf(fn).toEqualTypeOf<(x: number) => Promise<Result<boolean, 'error' | { readonly error: number }>>>();
    });

    it('async function input, mixed function mapper', async () => {
      const fn = result(async (data: number) => (data ? ok(data * 2) : err('error')))
        .mapOk(async (data) => (data ? Boolean(data > 1) : err({ error: data })))
        .mapOk((data) => ({ data }))
        .create();

      expect(await fn(1)).toEqual(ok({ data: true }));
      expectTypeOf(fn).toEqualTypeOf<
        (x: number) => Promise<Result<{ readonly data: boolean }, 'error' | { readonly error: number }>>
      >();
    });
  });

  describe('mapErr', () => {
    it('static input, function mapper', () => {
      const output = result(err(1))
        .mapErr((error) => (error ? err(error * 2) : ok('success')))
        .mapErr((error) => (error ? Boolean(error > 1) : err({ error })))
        .create();

      expect(output).toEqual(err(true));
      expectTypeOf(output).toEqualTypeOf<Result<'success', boolean | { readonly error: number }>>();
    });

    it('static input, async function mapper', async () => {
      const output = result(err(1))
        .mapErr(async (error) => (error ? err(error * 2) : ok('success')))
        .mapErr(async (error) => (error ? Boolean(error > 1) : err({ error })))
        .create();

      expect(await output).toEqual(err(true));
      expectTypeOf(output).toEqualTypeOf<Promise<Result<'success', boolean | { readonly error: number }>>>();
    });

    it('static input, mixed function mapper', async () => {
      const output = result(err(1))
        .mapErr(async (error) => (error ? err(error * 2) : ok('success')))
        .mapErr((error) => (error ? Boolean(error > 1) : err({ error })))
        .create();

      expect(await output).toEqual(err(true));
      expectTypeOf(output).toEqualTypeOf<Promise<Result<'success', boolean | { readonly error: number }>>>();
    });

    it('promise input, function mapper', async () => {
      const output = result(Promise.resolve(err(1)))
        .mapErr((error) => (error ? err(error * 2) : ok('success')))
        .mapErr((error) => (error ? Boolean(error > 1) : err({ error })))
        .create();

      expect(await output).toEqual(err(true));
      expectTypeOf(output).toEqualTypeOf<Promise<Result<'success', boolean | { readonly error: number }>>>();
    });

    it('promise input, async function mapper', async () => {
      const output = result(Promise.resolve(err(1)))
        .mapErr(async (error) => (error ? err(error * 2) : ok('success')))
        .mapErr(async (error) => (error ? Boolean(error > 1) : err({ error })))
        .create();

      expect(await output).toEqual(err(true));
      expectTypeOf(output).toEqualTypeOf<Promise<Result<'success', boolean | { readonly error: number }>>>();
    });

    it('promise input, mixed function mapper', async () => {
      const output = result(Promise.resolve(err(1)))
        .mapErr(async (error) => (error ? err(error * 2) : ok('success')))
        .mapErr((error) => (error ? Boolean(error > 1) : err({ error })))
        .create();

      expect(await output).toEqual(err(true));
      expectTypeOf(output).toEqualTypeOf<Promise<Result<'success', boolean | { readonly error: number }>>>();
    });

    it('function input, function mapper', () => {
      const fn = result((error: number) => (error ? err(error * 2) : ok('success')))
        .mapErr((error) => (error ? Boolean(error > 1) : err({ error })))
        .create();

      expect(fn(1)).toEqual(err(true));
      expectTypeOf(fn).toEqualTypeOf<(x: number) => Result<'success', boolean | { readonly error: number }>>();
    });

    it('function input, async function mapper', async () => {
      const fn = result((error: number) => (error ? err(error * 2) : ok('success')))
        .mapErr(async (error) => (error ? Boolean(error > 1) : err({ error })))
        .create();

      expect(await fn(1)).toEqual(err(true));
      expectTypeOf(fn).toEqualTypeOf<(x: number) => Promise<Result<'success', boolean | { readonly error: number }>>>();
    });

    it('function input, mixed function mapper', async () => {
      const fn = result((error: number) => (error ? err(error * 2) : ok('success')))
        .mapErr(async (error) => (error ? Boolean(error > 1) : ok({ status: 'success' })))
        .mapErr((error) => ({ error }))
        .create();

      expect(await fn(1)).toEqual(err({ error: true }));
      expectTypeOf(fn).toEqualTypeOf<
        (error: number) => Promise<Result<'success' | { readonly status: 'success' }, { readonly error: boolean }>>
      >();
    });

    it('async function input, function mapper', async () => {
      const fn = result(async (error: number) => (error ? err(error * 2) : ok('success')))
        .mapErr((error) => (error ? Boolean(error > 1) : err({ error })))
        .create();

      expect(await fn(1)).toEqual(err(true));
      expectTypeOf(fn).toEqualTypeOf<(x: number) => Promise<Result<'success', boolean | { readonly error: number }>>>();
    });

    it('async function input, async function mapper', async () => {
      const fn = result(async (error: number) => (error ? err(error * 2) : ok('success')))
        .mapErr(async (error) => (error ? Boolean(error > 1) : err({ error })))
        .create();

      expect(await fn(1)).toEqual(err(true));
      expectTypeOf(fn).toEqualTypeOf<(x: number) => Promise<Result<'success', boolean | { readonly error: number }>>>();
    });

    it('async function input, mixed function mapper', async () => {
      const fn = result(async (error: number) => (error ? err(error * 2) : ok('success')))
        .mapErr(async (error) => (error ? Boolean(error > 1) : ok({ status: 'success' })))
        .mapErr((error) => ({ error }))
        .create();

      expect(await fn(1)).toEqual(err({ error: true }));
      expectTypeOf(fn).toEqualTypeOf<
        (x: number) => Promise<Result<'success' | { readonly status: 'success' }, { readonly error: boolean }>>
      >();
    });
  });

  describe('match', () => {
    describe('static input', () => {
      const okInput = first(ok('success'), err('error'));
      const errInput = first(err('error'), ok('success'));

      it('function onOk, function onErr', () => {
        const okOutput = result(okInput).match(
          (data) => ({ data }),
          (error) => ({ error }),
        );

        expect(okOutput).toEqual({ data: 'success' });
        expectTypeOf(okOutput).toEqualTypeOf<Readonly<{ data: 'success' } | { error: 'error' }>>();

        const errOutput = result(errInput).match(
          (data) => ({ data }),
          (error) => ({ error }),
        );
        expect(errOutput).toEqual({ error: 'error' });
        expectTypeOf(errOutput).toEqualTypeOf<Readonly<{ data: 'success' } | { error: 'error' }>>();
      });

      it('function onOk, async function onErr', async () => {
        const okOutput = result(okInput).match(
          (data) => ({ data }),
          async (error) => ({ error }),
        );

        expect(await okOutput).toEqual({ data: 'success' });
        expectTypeOf(okOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();

        const errOutput = result(errInput).match(
          (data) => ({ data }),
          async (error) => ({ error }),
        );
        expect(await errOutput).toEqual({ error: 'error' });
        expectTypeOf(errOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();
      });

      it('function onOk, static onErr', () => {
        const okOutput = result(okInput).match((data) => ({ data }), 'some_error');

        expect(okOutput).toEqual({ data: 'success' });
        expectTypeOf(okOutput).toEqualTypeOf<{ readonly data: 'success' } | 'some_error'>();

        const errOutput = result(errInput).match((data) => ({ data }), 'some_error');
        expect(errOutput).toEqual('some_error');
        expectTypeOf(errOutput).toEqualTypeOf<{ readonly data: 'success' } | 'some_error'>();
      });

      it('function onOk, promise onErr', async () => {
        const okOutput = result(okInput).match((data) => ({ data }), Promise.resolve('some_error' as const));

        expect(await okOutput).toEqual({ data: 'success' });
        expectTypeOf(okOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();

        const errOutput = result(errInput).match((data) => ({ data }), Promise.resolve('some_error' as const));
        expect(await errOutput).toEqual('some_error');
        expectTypeOf(errOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();
      });

      it('async function onOk, function onErr', async () => {
        const okOutput = result(okInput).match(
          async (data) => ({ data }),
          (error) => ({ error }),
        );

        expect(await okOutput).toEqual({ data: 'success' });
        expectTypeOf(okOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();

        const errOutput = result(errInput).match(
          async (data) => ({ data }),
          (error) => ({ error }),
        );
        expect(await errOutput).toEqual({ error: 'error' });
        expectTypeOf(errOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();
      });

      it('async function onOk, async function onErr', async () => {
        const okOutput = result(okInput).match(
          async (data) => ({ data }),
          async (error) => ({ error }),
        );

        expect(await okOutput).toEqual({ data: 'success' });
        expectTypeOf(okOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();

        const errOutput = result(errInput).match(
          async (data) => ({ data }),
          async (error) => ({ error }),
        );
        expect(await errOutput).toEqual({ error: 'error' });
        expectTypeOf(errOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();
      });

      it('async function onOk, static onErr', async () => {
        const okOutput = result(okInput).match(async (data) => ({ data }), 'some_error');

        expect(await okOutput).toEqual({ data: 'success' });
        expectTypeOf(okOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();

        const errOutput = result(errInput).match(async (data) => ({ data }), 'some_error');
        expect(await errOutput).toEqual('some_error');
        expectTypeOf(errOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();
      });

      it('async function onOk, promise onErr', async () => {
        const okOutput = result(okInput).match(async (data) => ({ data }), Promise.resolve('some_error' as const));

        expect(await okOutput).toEqual({ data: 'success' });
        expectTypeOf(okOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();

        const errOutput = result(errInput).match(async (data) => ({ data }), Promise.resolve('some_error' as const));
        expect(await errOutput).toEqual('some_error');
        expectTypeOf(errOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();
      });

      it('static onOk, function onErr', () => {
        const okOutput = result(okInput).match('some_success', (error) => ({ error }));

        expect(okOutput).toEqual('some_success');
        expectTypeOf(okOutput).toEqualTypeOf<'some_success' | { readonly error: 'error' }>();

        const errOutput = result(errInput).match('some_success', (error) => ({ error }));
        expect(errOutput).toEqual({ error: 'error' });
        expectTypeOf(errOutput).toEqualTypeOf<'some_success' | { readonly error: 'error' }>();
      });

      it('static onOk, async function onErr', async () => {
        const okOutput = result(okInput).match('some_success', async (error) => ({ error }));

        expect(await okOutput).toEqual('some_success');
        expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();

        const errOutput = result(errInput).match('some_success', async (error) => ({
          error,
        }));
        expect(await errOutput).toEqual({ error: 'error' });
        expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();
      });

      it('static onOk, static onErr', () => {
        const okOutput = result(okInput).match('some_success', 'some_error');

        expect(okOutput).toEqual('some_success');
        expectTypeOf(okOutput).toEqualTypeOf<'some_success' | 'some_error'>();

        const errOutput = result(errInput).match('some_success', 'some_error');
        expect(errOutput).toEqual('some_error');
        expectTypeOf(errOutput).toEqualTypeOf<'some_success' | 'some_error'>();
      });

      it('static onOk, promise onErr', async () => {
        const okOutput = result(okInput).match('some_success', Promise.resolve('some_error' as const));

        expect(await okOutput).toEqual('some_success');
        expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();

        const errOutput = result(errInput).match('some_success', Promise.resolve('some_error' as const));
        expect(await errOutput).toEqual('some_error');
        expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();
      });

      it('promise onOk, function onErr', async () => {
        const okOutput = result(okInput).match(Promise.resolve('some_success' as const), (error) => ({ error }));

        expect(await okOutput).toEqual('some_success');
        expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();

        const errOutput = result(errInput).match(Promise.resolve('some_success' as const), (error) => ({ error }));
        expect(await errOutput).toEqual({ error: 'error' });
        expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();
      });

      it('promise onOk, async function onErr', async () => {
        const okOutput = result(okInput).match(Promise.resolve('some_success' as const), async (error) => ({ error }));

        expect(await okOutput).toEqual('some_success');
        expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();

        const errOutput = result(errInput).match(Promise.resolve('some_success' as const), async (error) => ({
          error,
        }));
        expect(await errOutput).toEqual({ error: 'error' });
        expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();
      });

      it('promise onOk, static onErr', async () => {
        const okOutput = result(okInput).match(Promise.resolve('some_success' as const), 'some_error');

        expect(await okOutput).toEqual('some_success');
        expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();

        const errOutput = result(errInput).match(Promise.resolve('some_success' as const), 'some_error');
        expect(await errOutput).toEqual('some_error');
        expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();
      });

      it('promise onOk, promise onErr', async () => {
        const okOutput = result(okInput).match(
          Promise.resolve('some_success' as const),
          Promise.resolve('some_error' as const),
        );

        expect(await okOutput).toEqual('some_success');
        expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();

        const errOutput = result(errInput).match(
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
        const okOutput = result(okInput).match(
          (data) => ({ data }),
          (error) => ({ error }),
        );

        expect(await okOutput).toEqual({ data: 'success' });
        expectTypeOf(okOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();

        const errOutput = result(errInput).match(
          (data) => ({ data }),
          (error) => ({ error }),
        );
        expect(await errOutput).toEqual({ error: 'error' });
        expectTypeOf(errOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();
      });

      it('function onOk, async function onErr', async () => {
        const okOutput = result(okInput).match(
          (data) => ({ data }),
          async (error) => ({ error }),
        );

        expect(await okOutput).toEqual({ data: 'success' });
        expectTypeOf(okOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();

        const errOutput = result(errInput).match(
          (data) => ({ data }),
          async (error) => ({ error }),
        );
        expect(await errOutput).toEqual({ error: 'error' });
        expectTypeOf(errOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();
      });

      it('function onOk, static onErr', async () => {
        const okOutput = result(okInput).match((data) => ({ data }), 'some_error');

        expect(await okOutput).toEqual({ data: 'success' });
        expectTypeOf(okOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();

        const errOutput = result(errInput).match((data) => ({ data }), 'some_error');
        expect(await errOutput).toEqual('some_error');
        expectTypeOf(errOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();
      });

      it('function onOk, promise onErr', async () => {
        const okOutput = result(okInput).match((data) => ({ data }), Promise.resolve('some_error' as const));

        expect(await okOutput).toEqual({ data: 'success' });
        expectTypeOf(okOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();

        const errOutput = result(errInput).match((data) => ({ data }), Promise.resolve('some_error' as const));
        expect(await errOutput).toEqual('some_error');
        expectTypeOf(errOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();
      });

      it('async function onOk, function onErr', async () => {
        const okOutput = result(okInput).match(
          async (data) => ({ data }),
          (error) => ({ error }),
        );

        expect(await okOutput).toEqual({ data: 'success' });
        expectTypeOf(okOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();

        const errOutput = result(errInput).match(
          async (data) => ({ data }),
          (error) => ({ error }),
        );
        expect(await errOutput).toEqual({ error: 'error' });
        expectTypeOf(errOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();
      });

      it('async function onOk, async function onErr', async () => {
        const okOutput = result(okInput).match(
          async (data) => ({ data }),
          async (error) => ({ error }),
        );

        expect(await okOutput).toEqual({ data: 'success' });
        expectTypeOf(okOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();

        const errOutput = result(errInput).match(
          async (data) => ({ data }),
          async (error) => ({ error }),
        );
        expect(await errOutput).toEqual({ error: 'error' });
        expectTypeOf(errOutput).toEqualTypeOf<Promise<Readonly<{ data: 'success' } | { error: 'error' }>>>();
      });

      it('async function onOk, static onErr', async () => {
        const okOutput = result(okInput).match(async (data) => ({ data }), 'some_error');

        expect(await okOutput).toEqual({ data: 'success' });
        expectTypeOf(okOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();

        const errOutput = result(errInput).match(async (data) => ({ data }), 'some_error');
        expect(await errOutput).toEqual('some_error');
        expectTypeOf(errOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();
      });

      it('async function onOk, promise onErr', async () => {
        const okOutput = result(okInput).match(async (data) => ({ data }), Promise.resolve('some_error' as const));

        expect(await okOutput).toEqual({ data: 'success' });
        expectTypeOf(okOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();

        const errOutput = result(errInput).match(async (data) => ({ data }), Promise.resolve('some_error' as const));
        expect(await errOutput).toEqual('some_error');
        expectTypeOf(errOutput).toEqualTypeOf<Promise<{ readonly data: 'success' } | 'some_error'>>();
      });

      it('static onOk, function onErr', async () => {
        const okOutput = result(okInput).match('some_success', (error) => ({ error }));

        expect(await okOutput).toEqual('some_success');
        expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();

        const errOutput = result(errInput).match('some_success', (error) => ({ error }));
        expect(await errOutput).toEqual({ error: 'error' });
        expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();
      });

      it('static onOk, async function onErr', async () => {
        const okOutput = result(okInput).match('some_success', async (error) => ({ error }));

        expect(await okOutput).toEqual('some_success');
        expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();

        const errOutput = result(errInput).match('some_success', async (error) => ({
          error,
        }));
        expect(await errOutput).toEqual({ error: 'error' });
        expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();
      });

      it('static onOk, static onErr', async () => {
        const okOutput = result(okInput).match('some_success', 'some_error');

        expect(await okOutput).toEqual('some_success');
        expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();

        const errOutput = result(errInput).match('some_success', 'some_error');
        expect(await errOutput).toEqual('some_error');
        expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();
      });

      it('static onOk, promise onErr', async () => {
        const okOutput = result(okInput).match('some_success', Promise.resolve('some_error' as const));

        expect(await okOutput).toEqual('some_success');
        expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();

        const errOutput = result(errInput).match('some_success', Promise.resolve('some_error' as const));
        expect(await errOutput).toEqual('some_error');
        expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();
      });

      it('promise onOk, function onErr', async () => {
        const okOutput = result(okInput).match(Promise.resolve('some_success' as const), (error) => ({ error }));

        expect(await okOutput).toEqual('some_success');
        expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();

        const errOutput = result(errInput).match(Promise.resolve('some_success' as const), (error) => ({ error }));
        expect(await errOutput).toEqual({ error: 'error' });
        expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();
      });

      it('promise onOk, async function onErr', async () => {
        const okOutput = result(okInput).match(Promise.resolve('some_success' as const), async (error) => ({ error }));

        expect(await okOutput).toEqual('some_success');
        expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();

        const errOutput = result(errInput).match(Promise.resolve('some_success' as const), async (error) => ({
          error,
        }));
        expect(await errOutput).toEqual({ error: 'error' });
        expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | { readonly error: 'error' }>>();
      });

      it('promise onOk, static onErr', async () => {
        const okOutput = result(okInput).match(Promise.resolve('some_success' as const), 'some_error');

        expect(await okOutput).toEqual('some_success');
        expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();

        const errOutput = result(errInput).match(Promise.resolve('some_success' as const), 'some_error');
        expect(await errOutput).toEqual('some_error');
        expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();
      });

      it('promise onOk, promise onErr', async () => {
        const okOutput = result(okInput).match(
          Promise.resolve('some_success' as const),
          Promise.resolve('some_error' as const),
        );

        expect(await okOutput).toEqual('some_success');
        expectTypeOf(okOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();

        const errOutput = result(errInput).match(
          Promise.resolve('some_success' as const),
          Promise.resolve('some_error' as const),
        );
        expect(await errOutput).toEqual('some_error');
        expectTypeOf(errOutput).toEqualTypeOf<Promise<'some_success' | 'some_error'>>();
      });
    });

    describe('function input', () => {
      const okInput = (x: number) => first(ok(x), err(-x));
      const errInput = (x: number) => first(err(-x), ok(x));

      it('function onOk, function onErr', () => {
        const okFn = result(okInput).match(
          (data) => ({ data }),
          (error) => ({ error }),
        );

        expect(okFn(1)).toEqual({ data: 1 });
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Readonly<{ data: number } | { error: number }>>();

        const errFn = result(errInput).match(
          (data) => ({ data }),
          (error) => ({ error }),
        );
        expect(errFn(1)).toEqual({ error: -1 });
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Readonly<{ data: number } | { error: number }>>();
      });

      it('function onOk, async function onErr', async () => {
        const okFn = result(okInput).match(
          (data) => ({ data }),
          async (error) => ({ error }),
        );

        expect(await okFn(1)).toEqual({ data: 1 });
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | { error: number }>>>();

        const errFn = result(errInput).match(
          (data) => ({ data }),
          async (error) => ({ error }),
        );
        expect(await errFn(1)).toEqual({ error: -1 });
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | { error: number }>>>();
      });

      it('function onOk, static onErr', () => {
        const okFn = result(okInput).match((data) => ({ data }), 'some_error');

        expect(okFn(1)).toEqual({ data: 1 });
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Readonly<{ data: number } | 'some_error'>>();

        const errFn = result(errInput).match((data) => ({ data }), 'some_error');
        expect(errFn(1)).toEqual('some_error');
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Readonly<{ data: number } | 'some_error'>>();
      });

      it('function onOk, promise onErr', async () => {
        const okFn = result(okInput).match((data) => ({ data }), Promise.resolve('some_error' as const));

        expect(await okFn(1)).toEqual({ data: 1 });
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | 'some_error'>>>();

        const errFn = result(errInput).match((data) => ({ data }), Promise.resolve('some_error' as const));
        expect(await errFn(1)).toEqual('some_error');
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | 'some_error'>>>();
      });

      it('async function onOk, function onErr', async () => {
        const okFn = result(okInput).match(
          async (data) => ({ data }),
          (error) => ({ error }),
        );

        expect(await okFn(1)).toEqual({ data: 1 });
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | { error: number }>>>();

        const errFn = result(errInput).match(
          async (data) => ({ data }),
          (error) => ({ error }),
        );
        expect(await errFn(1)).toEqual({ error: -1 });
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | { error: number }>>>();
      });

      it('async function onOk, async function onErr', async () => {
        const okFn = result(okInput).match(
          async (data) => ({ data }),
          async (error) => ({ error }),
        );

        expect(await okFn(1)).toEqual({ data: 1 });
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | { error: number }>>>();

        const errFn = result(errInput).match(
          async (data) => ({ data }),
          async (error) => ({ error }),
        );
        expect(await errFn(1)).toEqual({ error: -1 });
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | { error: number }>>>();
      });

      it('async function onOk, static onErr', async () => {
        const okFn = result(okInput).match(async (data) => ({ data }), 'some_error');

        expect(await okFn(1)).toEqual({ data: 1 });
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | 'some_error'>>>();

        const errFn = result(errInput).match(async (data) => ({ data }), 'some_error');
        expect(await errFn(1)).toEqual('some_error');
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | 'some_error'>>>();
      });

      it('async function onOk, promise onErr', async () => {
        const okFn = result(okInput).match(async (data) => ({ data }), Promise.resolve('some_error' as const));

        expect(await okFn(1)).toEqual({ data: 1 });
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | 'some_error'>>>();

        const errFn = result(errInput).match(async (data) => ({ data }), Promise.resolve('some_error' as const));
        expect(await errFn(1)).toEqual('some_error');
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | 'some_error'>>>();
      });

      it('static onOk, function onErr', () => {
        const okFn = result(okInput).match('some_success', (error) => ({ error }));

        expect(okFn(1)).toEqual('some_success');
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Readonly<{ error: number } | 'some_success'>>();

        const errFn = result(errInput).match('some_success', (error) => ({ error }));
        expect(errFn(1)).toEqual({ error: -1 });
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Readonly<{ error: number } | 'some_success'>>();
      });

      it('static onOk, async function onErr', async () => {
        const okFn = result(okInput).match('some_success', async (error) => ({ error }));

        expect(await okFn(1)).toEqual('some_success');
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ error: number } | 'some_success'>>>();

        const errFn = result(errInput).match('some_success', async (error) => ({
          error,
        }));
        expect(await errFn(1)).toEqual({ error: -1 });
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ error: number } | 'some_success'>>>();
      });

      it('static onOk, static onErr', () => {
        const okFn = result(okInput).match('some_success', 'some_error');

        expect(okFn(1)).toEqual('some_success');
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => 'some_success' | 'some_error'>();

        const errFn = result(errInput).match('some_success', 'some_error');
        expect(errFn(1)).toEqual('some_error');
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => 'some_success' | 'some_error'>();
      });

      it('static onOk, promise onErr', async () => {
        const okFn = result(okInput).match('some_success', Promise.resolve('some_error' as const));

        expect(await okFn(1)).toEqual('some_success');
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<'some_success' | 'some_error'>>();

        const errFn = result(errInput).match('some_success', Promise.resolve('some_error' as const));
        expect(await errFn(1)).toEqual('some_error');
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<'some_success' | 'some_error'>>();
      });

      it('promise onOk, sync onErr', async () => {
        const okFn = result(okInput).match(Promise.resolve('some_success' as const), (error) => ({ error }));

        expect(await okFn(1)).toEqual('some_success');
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<'some_success' | { readonly error: number }>>();

        const errFn = result(errInput).match(Promise.resolve('some_success' as const), (error) => ({ error }));
        expect(await errFn(1)).toEqual({ error: -1 });
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<'some_success' | { readonly error: number }>>();
      });

      it('promise onOk, async onErr', async () => {
        const okFn = result(okInput).match(Promise.resolve('some_success' as const), async (error) => ({ error }));

        expect(await okFn(1)).toEqual('some_success');
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<'some_success' | { readonly error: number }>>();

        const errFn = result(errInput).match(Promise.resolve('some_success' as const), async (error) => ({
          error,
        }));
        expect(await errFn(1)).toEqual({ error: -1 });
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<'some_success' | { readonly error: number }>>();
      });

      it('promise onOk, static onErr', async () => {
        const okFn = result(okInput).match(Promise.resolve('some_success' as const), 'some_error');

        expect(await okFn(1)).toEqual('some_success');
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<'some_success' | 'some_error'>>();

        const errFn = result(errInput).match(Promise.resolve('some_success' as const), 'some_error');
        expect(await errFn(1)).toEqual('some_error');
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<'some_success' | 'some_error'>>();
      });

      it('promise onOk, promise onErr', async () => {
        const okFn = result(okInput).match(
          Promise.resolve('some_success' as const),
          Promise.resolve('some_error' as const),
        );

        expect(await okFn(1)).toEqual('some_success');
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<'some_success' | 'some_error'>>();

        const errFn = result(errInput).match(
          Promise.resolve('some_success' as const),
          Promise.resolve('some_error' as const),
        );
        expect(await errFn(1)).toEqual('some_error');
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<'some_success' | 'some_error'>>();
      });
    });

    describe('async function input', () => {
      const okInput = async (x: number) => first(ok(x), err(-x));
      const errInput = async (x: number) => first(err(-x), ok(x));

      it('function onOk, function onErr', async () => {
        const okFn = result(okInput).match(
          (data) => ({ data }),
          (error) => ({ error }),
        );

        expect(await okFn(1)).toEqual({ data: 1 });
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | { error: number }>>>();

        const errFn = result(errInput).match(
          (data) => ({ data }),
          (error) => ({ error }),
        );
        expect(await errFn(1)).toEqual({ error: -1 });
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | { error: number }>>>();
      });

      it('function onOk, async function onErr', async () => {
        const okFn = result(okInput).match(
          (data) => ({ data }),
          async (error) => ({ error }),
        );

        expect(await okFn(1)).toEqual({ data: 1 });
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | { error: number }>>>();

        const errFn = result(errInput).match(
          (data) => ({ data }),
          async (error) => ({ error }),
        );
        expect(await errFn(1)).toEqual({ error: -1 });
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | { error: number }>>>();
      });

      it('function onOk, static onErr', async () => {
        const okFn = result(okInput).match((data) => ({ data }), 'some_error');

        expect(await okFn(1)).toEqual({ data: 1 });
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | 'some_error'>>>();

        const errFn = result(errInput).match((data) => ({ data }), 'some_error');
        expect(await errFn(1)).toEqual('some_error');
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | 'some_error'>>>();
      });

      it('function onOk, promise onErr', async () => {
        const okFn = result(okInput).match((data) => ({ data }), Promise.resolve('some_error' as const));

        expect(await okFn(1)).toEqual({ data: 1 });
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | 'some_error'>>>();

        const errFn = result(errInput).match((data) => ({ data }), Promise.resolve('some_error' as const));
        expect(await errFn(1)).toEqual('some_error');
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | 'some_error'>>>();
      });

      it('async function onOk, function onErr', async () => {
        const okFn = result(okInput).match(
          async (data) => ({ data }),
          (error) => ({ error }),
        );

        expect(await okFn(1)).toEqual({ data: 1 });
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | { error: number }>>>();

        const errFn = result(errInput).match(
          async (data) => ({ data }),
          (error) => ({ error }),
        );
        expect(await errFn(1)).toEqual({ error: -1 });
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | { error: number }>>>();
      });

      it('async function onOk, async function onErr', async () => {
        const okFn = result(okInput).match(
          async (data) => ({ data }),
          async (error) => ({ error }),
        );

        expect(await okFn(1)).toEqual({ data: 1 });
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | { error: number }>>>();

        const errFn = result(errInput).match(
          async (data) => ({ data }),
          async (error) => ({ error }),
        );
        expect(await errFn(1)).toEqual({ error: -1 });
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | { error: number }>>>();
      });

      it('async function onOk, static onErr', async () => {
        const okFn = result(okInput).match(async (data) => ({ data }), 'some_error');

        expect(await okFn(1)).toEqual({ data: 1 });
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | 'some_error'>>>();

        const errFn = result(errInput).match(async (data) => ({ data }), 'some_error');
        expect(await errFn(1)).toEqual('some_error');
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | 'some_error'>>>();
      });

      it('async function onOk, promise onErr', async () => {
        const okFn = result(okInput).match(async (data) => ({ data }), Promise.resolve('some_error' as const));

        expect(await okFn(1)).toEqual({ data: 1 });
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | 'some_error'>>>();

        const errFn = result(errInput).match(async (data) => ({ data }), Promise.resolve('some_error' as const));
        expect(await errFn(1)).toEqual('some_error');
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ data: number } | 'some_error'>>>();
      });

      it('static onOk, function onErr', async () => {
        const okFn = result(okInput).match('some_success', (error) => ({ error }));

        expect(await okFn(1)).toEqual('some_success');
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ error: number } | 'some_success'>>>();

        const errFn = result(errInput).match('some_success', (error) => ({ error }));
        expect(await errFn(1)).toEqual({ error: -1 });
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ error: number } | 'some_success'>>>();
      });

      it('static onOk, async function onErr', async () => {
        const okFn = result(okInput).match('some_success', async (error) => ({ error }));

        expect(await okFn(1)).toEqual('some_success');
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ error: number } | 'some_success'>>>();

        const errFn = result(errInput).match('some_success', async (error) => ({
          error,
        }));
        expect(await errFn(1)).toEqual({ error: -1 });
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<Readonly<{ error: number } | 'some_success'>>>();
      });

      it('static onOk, static onErr', async () => {
        const okFn = result(okInput).match('some_success', 'some_error');

        expect(await okFn(1)).toEqual('some_success');
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<'some_success' | 'some_error'>>();

        const errFn = result(errInput).match('some_success', 'some_error');
        expect(await errFn(1)).toEqual('some_error');
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<'some_success' | 'some_error'>>();
      });

      it('static onOk, promise onErr', async () => {
        const okFn = result(okInput).match('some_success', Promise.resolve('some_error' as const));

        expect(await okFn(1)).toEqual('some_success');
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<'some_success' | 'some_error'>>();

        const errFn = result(errInput).match('some_success', Promise.resolve('some_error' as const));
        expect(await errFn(1)).toEqual('some_error');
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<'some_success' | 'some_error'>>();
      });

      it('promise onOk, function onErr', async () => {
        const okFn = result(okInput).match(Promise.resolve('some_success' as const), (error) => ({ error }));

        expect(await okFn(1)).toEqual('some_success');
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<'some_success' | { readonly error: number }>>();

        const errFn = result(errInput).match(Promise.resolve('some_success' as const), (error) => ({ error }));
        expect(await errFn(1)).toEqual({ error: -1 });
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<'some_success' | { readonly error: number }>>();
      });

      it('promise onOk, async function onErr', async () => {
        const okFn = result(okInput).match(Promise.resolve('some_success' as const), async (error) => ({ error }));

        expect(await okFn(1)).toEqual('some_success');
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<'some_success' | { readonly error: number }>>();

        const errFn = result(errInput).match(Promise.resolve('some_success' as const), async (error) => ({
          error,
        }));
        expect(await errFn(1)).toEqual({ error: -1 });
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<'some_success' | { readonly error: number }>>();
      });

      it('promise onOk, static onErr', async () => {
        const okFn = result(okInput).match(Promise.resolve('some_success' as const), 'some_error');

        expect(await okFn(1)).toEqual('some_success');
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<'some_success' | 'some_error'>>();

        const errFn = result(errInput).match(Promise.resolve('some_success' as const), 'some_error');
        expect(await errFn(1)).toEqual('some_error');
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<'some_success' | 'some_error'>>();
      });

      it('promise onOk, promise onErr', async () => {
        const okFn = result(okInput).match(
          Promise.resolve('some_success' as const),
          Promise.resolve('some_error' as const),
        );

        expect(await okFn(1)).toEqual('some_success');
        expectTypeOf(okFn).toEqualTypeOf<(x: number) => Promise<'some_success' | 'some_error'>>();

        const errFn = result(errInput).match(
          Promise.resolve('some_success' as const),
          Promise.resolve('some_error' as const),
        );
        expect(await errFn(1)).toEqual('some_error');
        expectTypeOf(errFn).toEqualTypeOf<(x: number) => Promise<'some_success' | 'some_error'>>();
      });
    });
  });
});
