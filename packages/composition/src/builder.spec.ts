import { describe, expect, expectTypeOf, it } from 'vitest';
import { flow, pipe } from './builder.js';

describe('builder.ts', () => {
  describe('flow', () => {
    it('composes sync functions', () => {
      const fn = flow((x: string) => x.length)
        .andThen((x) => x * 2)
        .andThen((x) => x + 3)
        .create();

      expect(fn('xx')).toBe(7);
      expect(fn('xyz')).toBe(9);
      expectTypeOf(fn).toEqualTypeOf<(x: string) => number>();
    });

    it('composes async functions', async () => {
      const fn = flow(async (x: string) => x.length)
        .andThen(async (x) => x * 2)
        .andThen(async (x) => x + 3)
        .create();

      expect(await fn('xx')).toBe(7);
      expect(await fn('xyz')).toBe(9);
      expectTypeOf(fn).toEqualTypeOf<(x: string) => Promise<number>>();
    });

    it('composes mixed sync and async functions', async () => {
      const fn = flow((x: string) => x.length)
        .andThen(async (x) => x * 2)
        .andThen((x) => x + 3)
        .create();

      expect(await fn('xx')).toBe(7);
      expect(await fn('xyz')).toBe(9);
      expectTypeOf(fn).toEqualTypeOf<(x: string) => Promise<number>>();
    });
  });

  describe('pipe', () => {
    it('composes sync functions', () => {
      const result = pipe('xx')
        .andThen((x) => x.length)
        .andThen((x) => x * 2)
        .andThen((x) => x + 3)
        .run();

      expect(result).toBe(7);
      expectTypeOf(result).toEqualTypeOf<number>();
    });

    it('composes async functions', async () => {
      const result = pipe('xx')
        .andThen(async (x) => x.length)
        .andThen(async (x) => x * 2)
        .andThen(async (x) => x + 3)
        .run();

      expect(await result).toBe(7);
      expectTypeOf(result).toEqualTypeOf<Promise<number>>();
    });

    it('composes mixed sync and async functions', async () => {
      const result = pipe('xx')
        .andThen((x) => x.length)
        .andThen(async (x) => x * 2)
        .andThen((x) => x + 3)
        .run();

      expect(await result).toBe(7);
      expectTypeOf(result).toEqualTypeOf<Promise<number>>();
    });

    it('composes with a promise', async () => {
      const result = pipe(Promise.resolve('xx'))
        .andThen((x) => x.length)
        .andThen((x) => x * 2)
        .andThen((x) => x + 3)
        .run();

      expect(await result).toBe(7);
      expectTypeOf(result).toEqualTypeOf<Promise<number>>();
    });
  });
});
