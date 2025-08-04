import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { flow, pipe } from './index.js';

describe('index.ts', () => {
  describe('flow', () => {
    it('composes sync functions', () => {
      const fn = flow(
        (x: string) => x.length,
        (x) => x * 2,
        (x) => x + 3,
      );

      expect(fn('xx')).toBe(7);
      expect(fn('xyz')).toBe(9);
      expectTypeOf(fn).toEqualTypeOf<(x: string) => number>();
    });

    it('composes async functions', async () => {
      const fn = flow(
        async (x: string) => x.length,
        async (x) => x * 2,
        async (x) => x + 3,
      );

      expect(await fn('xx')).toBe(7);
      expect(await fn('xyz')).toBe(9);
      expectTypeOf(fn).toEqualTypeOf<(x: string) => Promise<number>>();
    });

    it('composes mixed sync and async functions', async () => {
      const fn = flow(
        (x: string) => x.length,
        async (x) => x * 2,
        (x) => x + 3,
      );

      expect(await fn('xx')).toBe(7);
      expect(await fn('xyz')).toBe(9);
      expectTypeOf(fn).toEqualTypeOf<(x: string) => Promise<number>>();
    });

    it('calls each function only once', async () => {
      const fn1 = vi.fn((x: string) => x.length);
      const fn2 = vi.fn(async (x: number) => x * 2);
      const fn3 = vi.fn((x: number) => x + 3);

      const fn = flow(fn1, fn2, fn3);

      expect(await fn('xx')).toBe(7);

      expect(fn1).toHaveBeenCalledOnce();
      expect(fn2).toHaveBeenCalledOnce();
      expect(fn3).toHaveBeenCalledOnce();
    });

    it('returns noop function if no functions are provided', async () => {
      const fn = flow();
      expect(fn()).toBeUndefined();
      expectTypeOf(fn).toEqualTypeOf<() => void>();
    });
  });

  describe('pipe', () => {
    it('composes sync functions', () => {
      const result = pipe(
        'xx',
        (x) => x.length,
        (x) => x * 2,
        (x) => x + 3,
      );

      expect(result).toBe(7);
      expectTypeOf(result).toEqualTypeOf<number>();
    });

    it('composes async functions', async () => {
      const result = pipe(
        'xx',
        async (x) => x.length,
        async (x) => x * 2,
        async (x) => x + 3,
      );

      expect(await result).toBe(7);
      expectTypeOf(result).toEqualTypeOf<Promise<number>>();
    });

    it('composes mixed sync and async functions', async () => {
      const result = pipe(
        'xx',
        (x) => x.length,
        async (x) => x * 2,
        (x) => x + 3,
      );

      expect(await result).toBe(7);
      expectTypeOf(result).toEqualTypeOf<Promise<number>>();
    });

    it('composes with a promise', async () => {
      const result = pipe(
        Promise.resolve('xx'),
        (x) => x.length,
        (x) => x * 2,
        (x) => x + 3,
      );

      expect(await result).toBe(7);
      expectTypeOf(result).toEqualTypeOf<Promise<number>>();
    });

    it('calls each function only once', async () => {
      const fn1 = vi.fn((x: string) => x.length);
      const fn2 = vi.fn(async (x: number) => x * 2);
      const fn3 = vi.fn((x: number) => x + 3);

      expect(await pipe('xx', fn1, fn2, fn3)).toBe(7);

      expect(fn1).toHaveBeenCalledOnce();
      expect(fn2).toHaveBeenCalledOnce();
      expect(fn3).toHaveBeenCalledOnce();
    });

    it('returns the first argument if no functions are provided', async () => {
      expect(pipe('xx')).toBe('xx');
      expectTypeOf(pipe('xx')).toBeString();

      expect(await pipe(Promise.resolve('xx'))).toBe('xx');
      expectTypeOf(pipe(Promise.resolve('xx'))).toEqualTypeOf<Promise<string>>();
    });
  });
});
