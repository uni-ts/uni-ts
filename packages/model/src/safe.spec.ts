import type { Err, Ok, Result, UnknownResult } from '@uni-ts/result';
import { isErr, isOk } from '@uni-ts/result';
import { type } from 'arktype';
import * as v from 'valibot';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import { ModelValidationError } from './error.js';
import { oneOf } from './helpers.js';
import { createSafeFirstModel, createSafeModel, createUnsafeFirstModel, type InferModelOutput } from './safe.js';

describe('safe.ts', () => {
  function expectToBeOkResult(result: UnknownResult, value: unknown) {
    expect(isOk(result)).toBe(true);
    expect((result as Ok<unknown>).data).toEqual(value);
  }

  function expectToBeErrorResult(result: UnknownResult) {
    expect(isErr(result)).toBe(true);
    expect((result as Err<unknown>).error).toBeInstanceOf(ModelValidationError);
  }

  describe('createSafeModel', () => {
    type Email = InferModelOutput<typeof Email>;
    const Email = createSafeModel(
      oneOf(z.email().brand('Email'), v.pipe(v.string(), v.email(), v.brand('Email')), type('string.email#Email')),
    );

    type EmailResult = Result<Email, ModelValidationError>;

    describe('from', () => {
      it('returns ok result if value matches the model schema', () => {
        const email = Email.from('correct@email.com');
        expectToBeOkResult(email, 'correct@email.com');
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it("returns err result if value doesn't match the model schema", () => {
        const email = Email.from('incorrect-email');
        expectToBeErrorResult(email);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it('accepts only model schema input types as value', () => {
        // @ts-expect-error - incorrect type
        expectToBeErrorResult(Email.from(123));
        // @ts-expect-error - incorrect type
        expectToBeErrorResult(Email.from(null));
        // @ts-expect-error - incorrect type
        expectToBeErrorResult(Email.from({}));
      });
    });

    describe('cast', () => {
      it('returns ok result if value matches the model schema', () => {
        const email = Email.cast('correct@email.com');
        expectToBeOkResult(email, 'correct@email.com');
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it("returns err result if value doesn't match the model schema", () => {
        const email = Email.cast('incorrect-email');
        expectToBeErrorResult(email);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it('accepts any value as input', () => {
        expectToBeErrorResult(Email.cast(123));
        expectToBeErrorResult(Email.cast(null));
        expectToBeErrorResult(Email.cast({}));
      });
    });
  });

  describe('createSafeFirstModel', () => {
    type Email = InferModelOutput<typeof Email>;
    const Email = createSafeFirstModel(
      oneOf(z.email().brand('Email'), v.pipe(v.string(), v.email(), v.brand('Email')), type('string.email#Email')),
    );

    type EmailResult = Result<Email, ModelValidationError>;

    describe('from', () => {
      it('returns ok result if value matches the model schema', () => {
        const email = Email.from('correct@email.com');
        expectToBeOkResult(email, 'correct@email.com');
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it("returns err result if value doesn't match the model schema", () => {
        const email = Email.from('incorrect-email');
        expectToBeErrorResult(email);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it('accepts only model schema input types as value', () => {
        // @ts-expect-error - incorrect type
        expectToBeErrorResult(Email.from(123));
        // @ts-expect-error - incorrect type
        expectToBeErrorResult(Email.from(null));
        // @ts-expect-error - incorrect type
        expectToBeErrorResult(Email.from({}));
      });
    });

    describe('cast', () => {
      it('returns ok result if value matches the model schema', () => {
        const email = Email.cast('correct@email.com');
        expectToBeOkResult(email, 'correct@email.com');
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it("returns err result if value doesn't match the model schema", () => {
        const email = Email.cast('incorrect-email');
        expectToBeErrorResult(email);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it('accepts any value as input', () => {
        expectToBeErrorResult(Email.cast(123));
        expectToBeErrorResult(Email.cast(null));
        expectToBeErrorResult(Email.cast({}));
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
    type Email = InferModelOutput<typeof Email>;
    const Email = createUnsafeFirstModel(
      oneOf(z.email().brand('Email'), v.pipe(v.string(), v.email(), v.brand('Email')), type('string.email#Email')),
    );

    type EmailResult = Result<Email, ModelValidationError>;

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
        expectToBeOkResult(email, 'correct@email.com');
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it("returns err result if value doesn't match the model schema", () => {
        const email = Email.safeFrom('incorrect-email');
        expectToBeErrorResult(email);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it('accepts only model schema input types as value', () => {
        // @ts-expect-error - incorrect type
        expectToBeErrorResult(Email.safeFrom(123));
        // @ts-expect-error - incorrect type
        expectToBeErrorResult(Email.safeFrom(null));
        // @ts-expect-error - incorrect type
        expectToBeErrorResult(Email.safeFrom({}));
      });
    });

    describe('safeCast', () => {
      it('returns ok result if value matches the model schema', () => {
        const email = Email.safeCast('correct@email.com');
        expectToBeOkResult(email, 'correct@email.com');
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it("returns err result if value doesn't match the model schema", () => {
        const email = Email.safeCast('incorrect-email');
        expectToBeErrorResult(email);
        expectTypeOf(email).toEqualTypeOf<EmailResult>();
      });

      it('accepts any value as input', () => {
        expectToBeErrorResult(Email.safeCast(123));
        expectToBeErrorResult(Email.safeCast(null));
        expectToBeErrorResult(Email.safeCast({}));
      });
    });
  });
});
