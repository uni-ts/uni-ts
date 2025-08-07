import { describe, expect, it } from 'vitest';
import { isCtx, next } from './helpers.js';

describe('helpers.ts', () => {
  describe('next', () => {
    it('creates context object with empty value by default', () => {
      const ctx = next();

      expect(isCtx(ctx)).toBe(true);
      expect(ctx.type).toBe('ctx');
      expect(ctx.value).toEqual({});
    });

    it('creates context object with provided value', () => {
      const value = { key: 'test', number: 42 };
      const ctx = next(value);

      expect(isCtx(ctx)).toBe(true);
      expect(ctx.type).toBe('ctx');
      expect(ctx.value).toEqual(value);
    });
  });
});
