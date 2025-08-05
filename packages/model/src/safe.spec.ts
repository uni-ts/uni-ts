import type { Result } from '@uni-ts/result';
import { isErr, isOk } from '@uni-ts/result';
import { type } from 'arktype';
import * as v from 'valibot';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import { ModelValidationError } from './error.js';
import { oneOf } from './helpers.js';
import { createSafeFirstModel, createSafeModel, createUnsafeFirstModel, type InferModelType } from './safe.js';
import type { StandardSchemaV1 } from './standard-schema.js';

describe('safe.ts', () => {
  describe('createSafeModel', () => {
    type Email = InferModelType<typeof Email>;
    const Email = createSafeModel(
      oneOf(z.email().brand('Email'), v.pipe(v.string(), v.email(), v.brand('Email')), type('string.email#Email')),
    );

    type EmailResult = Result<Email, StandardSchemaV1.FailureResult['issues']>;

    describe('from', () => {
      it('returns ok result if value matches the model schema', () => {
        const email = Email.from('correct@email.com');
        expect(isOk(email)).toBe(true);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it("returns err result if value doesn't match the model schema", () => {
        const email = Email.from('incorrect-email');
        expect(isErr(email)).toBe(true);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it('accepts only model schema input types as value', () => {
        // @ts-expect-error - incorrect type
        expect(isErr(Email.from(123))).toBe(true);
        // @ts-expect-error - incorrect type
        expect(isErr(Email.from(null))).toBe(true);
        // @ts-expect-error - incorrect type
        expect(isErr(Email.from({}))).toBe(true);
      });
    });

    describe('cast', () => {
      it('returns ok result if value matches the model schema', () => {
        const email = Email.cast('correct@email.com');
        expect(isOk(email)).toBe(true);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it("returns err result if value doesn't match the model schema", () => {
        const email = Email.cast('incorrect-email');
        expect(isErr(email)).toBe(true);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it('accepts any value as input', () => {
        expect(isErr(Email.cast(123))).toBe(true);
        expect(isErr(Email.cast(null))).toBe(true);
        expect(isErr(Email.cast({}))).toBe(true);
      });
    });
  });

  describe('createSafeFirstModel', () => {
    type Email = InferModelType<typeof Email>;
    const Email = createSafeFirstModel(
      oneOf(z.email().brand('Email'), v.pipe(v.string(), v.email(), v.brand('Email')), type('string.email#Email')),
    );

    type EmailResult = Result<Email, StandardSchemaV1.FailureResult['issues']>;

    describe('from', () => {
      it('returns ok result if value matches the model schema', () => {
        const email = Email.from('correct@email.com');
        expect(isOk(email)).toBe(true);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it("returns err result if value doesn't match the model schema", () => {
        const email = Email.from('incorrect-email');
        expect(isErr(email)).toBe(true);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it('accepts only model schema input types as value', () => {
        // @ts-expect-error - incorrect type
        expect(isErr(Email.from(123))).toBe(true);
        // @ts-expect-error - incorrect type
        expect(isErr(Email.from(null))).toBe(true);
        // @ts-expect-error - incorrect type
        expect(isErr(Email.from({}))).toBe(true);
      });
    });

    describe('cast', () => {
      it('returns ok result if value matches the model schema', () => {
        const email = Email.cast('correct@email.com');
        expect(isOk(email)).toBe(true);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it("returns err result if value doesn't match the model schema", () => {
        const email = Email.cast('incorrect-email');
        expect(isErr(email)).toBe(true);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it('accepts any value as input', () => {
        expect(isErr(Email.cast(123))).toBe(true);
        expect(isErr(Email.cast(null))).toBe(true);
        expect(isErr(Email.cast({}))).toBe(true);
      });
    });

    describe('unsafeFrom', () => {
      it('returns a model if value matches the model schema', () => {
        const email = Email.unsafeFrom('correct@email.com');
        expect(email).toBe('correct@email.com');
        expectTypeOf(email).toEqualTypeOf<Email>();
      });

      it("throws a ModelValidationError if value doesn't match the model schema", () => {
        expect(() => Email.unsafeFrom('incorrect-email')).toThrow(ModelValidationError);
        expect(() => Email.unsafeFrom('')).toThrow(ModelValidationError);
      });

      it('accepts only model schema input types as value', () => {
        // @ts-expect-error - incorrect type
        expect(() => Email.unsafeFrom(123)).toThrow(ModelValidationError);
        // @ts-expect-error - incorrect type
        expect(() => Email.unsafeFrom(null)).toThrow(ModelValidationError);
        // @ts-expect-error - incorrect type
        expect(() => Email.unsafeFrom({})).toThrow(ModelValidationError);
      });
    });

    describe('unsafeCast', () => {
      it('returns a model if value matches the model schema', () => {
        const email = Email.unsafeCast('correct@email.com');
        expect(email).toBe('correct@email.com');
        expectTypeOf(email).toEqualTypeOf<Email>();
      });

      it("throws a ModelValidationError if value doesn't match the model schema", () => {
        expect(() => Email.unsafeCast('incorrect-email')).toThrow(ModelValidationError);
        expect(() => Email.unsafeCast('')).toThrow(ModelValidationError);
      });

      it('accepts any value as input', () => {
        expect(() => Email.unsafeCast(123)).toThrow(ModelValidationError);
        expect(() => Email.unsafeCast(null)).toThrow(ModelValidationError);
        expect(() => Email.unsafeCast({})).toThrow(ModelValidationError);
      });
    });
  });

  describe('createUnsafeFirstModel', () => {
    type Email = InferModelType<typeof Email>;
    const Email = createUnsafeFirstModel(
      oneOf(z.email().brand('Email'), v.pipe(v.string(), v.email(), v.brand('Email')), type('string.email#Email')),
    );

    type EmailResult = Result<Email, StandardSchemaV1.FailureResult['issues']>;

    describe('from', () => {
      it('returns a model if value matches the model schema', () => {
        const email = Email.from('correct@email.com');
        expect(email).toBe('correct@email.com');
        expectTypeOf(email).toEqualTypeOf<Email>();
      });

      it("throws a ModelValidationError if value doesn't match the model schema", () => {
        expect(() => Email.from('incorrect-email')).toThrow(ModelValidationError);
        expect(() => Email.from('')).toThrow(ModelValidationError);
      });

      it('accepts only model schema input types as value', () => {
        // @ts-expect-error - incorrect type
        expect(() => Email.from(123)).toThrow(ModelValidationError);
        // @ts-expect-error - incorrect type
        expect(() => Email.from(null)).toThrow(ModelValidationError);
        // @ts-expect-error - incorrect type
        expect(() => Email.from({})).toThrow(ModelValidationError);
      });
    });

    describe('cast', () => {
      it('returns a model if value matches the model schema', () => {
        const email = Email.cast('correct@email.com');
        expect(email).toBe('correct@email.com');
        expectTypeOf(email).toEqualTypeOf<Email>();
      });

      it("throws a ModelValidationError if value doesn't match the model schema", () => {
        expect(() => Email.cast('incorrect-email')).toThrow(ModelValidationError);
        expect(() => Email.cast('')).toThrow(ModelValidationError);
      });

      it('accepts any value as input', () => {
        expect(() => Email.cast(123)).toThrow(ModelValidationError);
        expect(() => Email.cast(null)).toThrow(ModelValidationError);
        expect(() => Email.cast({})).toThrow(ModelValidationError);
      });
    });

    describe('safeFrom', () => {
      it('returns ok result if value matches the model schema', () => {
        const email = Email.safeFrom('correct@email.com');
        expect(isOk(email)).toBe(true);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it("returns err result if value doesn't match the model schema", () => {
        const email = Email.safeFrom('incorrect-email');
        expect(isErr(email)).toBe(true);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it('accepts only model schema input types as value', () => {
        // @ts-expect-error - incorrect type
        expect(isErr(Email.safeFrom(123))).toBe(true);
        // @ts-expect-error - incorrect type
        expect(isErr(Email.safeFrom(null))).toBe(true);
        // @ts-expect-error - incorrect type
        expect(isErr(Email.safeFrom({}))).toBe(true);
      });
    });

    describe('safeCast', () => {
      it('returns ok result if value matches the model schema', () => {
        const email = Email.safeCast('correct@email.com');
        expect(isOk(email)).toBe(true);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it("returns err result if value doesn't match the model schema", () => {
        const email = Email.safeCast('incorrect-email');
        expect(isErr(email)).toBe(true);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it('accepts any value as input', () => {
        expect(isErr(Email.safeCast(123))).toBe(true);
        expect(isErr(Email.safeCast(null))).toBe(true);
        expect(isErr(Email.safeCast({}))).toBe(true);
      });
    });
  });
});
