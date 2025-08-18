import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import { derive } from './derive.js';
import { createModel } from './index.js';
import { createSafeFirstModel, createSafeModel, createUnsafeFirstModel } from './safe.js';

describe('derive', () => {
  const userSchema = z.object({ name: z.string(), email: z.email() });

  describe.for([
    { makeModel: createModel, name: 'createModel' },
    { makeModel: createSafeModel, name: 'createSafeModel' },
    { makeModel: createSafeFirstModel, name: 'createSafeFirstModel' },
    { makeModel: createUnsafeFirstModel, name: 'createUnsafeFirstModel' },
  ])('$name', ({ makeModel }) => {
    it('derives all non-base properties when no keys are specified', () => {
      const User = makeModel(userSchema, {
        displayName: (user: { name: string }) => user.name.toUpperCase(),
        isAdmin: false,
        permissions: ['read', 'write'],
      });

      const derived = derive(User);

      expect(derived).toEqual({
        displayName: expect.any(Function),
        isAdmin: false,
        permissions: ['read', 'write'],
      });

      expect(derived.displayName({ name: 'john' })).toBe('JOHN');
      expect(derived.isAdmin).toBe(false);
      expect(derived.permissions).toEqual(['read', 'write']);

      expectTypeOf(derived).toEqualTypeOf<
        Readonly<{
          displayName: (user: { name: string }) => string;
          isAdmin: false;
          permissions: readonly ['read', 'write'];
        }>
      >();
    });

    it('derives specific properties when keys are provided', () => {
      const User = makeModel(userSchema, {
        displayName: (user: { name: string }) => user.name.toUpperCase(),
        isAdmin: false,
        permissions: ['read', 'write'],
        metadata: { version: 1 },
      });

      const derived = derive(User, ['displayName', 'isAdmin']);

      expect(derived).toEqual({
        displayName: expect.any(Function),
        isAdmin: false,
      });

      expect(derived).not.toHaveProperty('permissions');
      expect(derived).not.toHaveProperty('metadata');

      expectTypeOf(derived).toEqualTypeOf<{
        readonly displayName: (user: { name: string }) => string;
        readonly isAdmin: false;
      }>();
    });

    it('returns empty object when model has no custom properties', () => {
      const User = makeModel(userSchema);
      const derived = derive(User);

      expect(derived).toEqual({});
      expectTypeOf(derived).toEqualTypeOf<{}>();
    });

    it('returns empty object when specified keys do not exist', () => {
      const User = makeModel(userSchema, { existingProp: 'value' });

      const derived = derive(User, []);

      expect(derived).toEqual({});
      expectTypeOf(derived).toEqualTypeOf<{}>();
    });
  });
});
