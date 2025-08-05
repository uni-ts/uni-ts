import { type } from 'arktype';
import * as v from 'valibot';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import { ModelValidationError } from './error.js';
import { oneOf } from './helpers.js';
import { createModel, type InferModelType } from './index.js';

describe('index.ts', () => {
  describe('InferModelType', () => {
    describe('infers the schema property type from given model', () => {
      it('infers the output type from schema', () => {
        const stringModel = createModel(oneOf(z.string(), v.string(), type('string')));
        expectTypeOf<InferModelType<typeof stringModel>>().toEqualTypeOf<string>();

        const stringLiteralModel = createModel(oneOf(z.literal('hello1'), v.literal('hello2'), type('"hello3"')));
        expectTypeOf<InferModelType<typeof stringLiteralModel>>().toEqualTypeOf<'hello1' | 'hello2' | 'hello3'>();

        const numberModel = createModel(oneOf(z.number(), v.number(), type('number')));
        expectTypeOf<InferModelType<typeof numberModel>>().toEqualTypeOf<number>();

        const booleanModel = createModel(oneOf(z.boolean(), v.boolean(), type('boolean')));
        expectTypeOf<InferModelType<typeof booleanModel>>().toEqualTypeOf<boolean>();

        const arrayModel = createModel(oneOf(z.array(z.string()), v.array(v.string()), type('string[]')));
        expectTypeOf<InferModelType<typeof arrayModel>>().toEqualTypeOf<string[]>();

        const objectModel = createModel(
          oneOf(z.object({ name: z.string() }), v.object({ name: v.string() }), type({ name: 'string' })),
        );
        expectTypeOf<InferModelType<typeof objectModel>>().toEqualTypeOf<{ name: string }>();

        const unionModel = createModel(
          oneOf(z.union([z.string(), z.number()]), v.union([v.string(), v.number()]), type('string | number')),
        );
        expectTypeOf<InferModelType<typeof unionModel>>().toEqualTypeOf<string | number>();

        const optionalModel = createModel(
          oneOf(z.string().optional(), v.optional(v.string()), type('string | undefined')),
        );
        expectTypeOf<InferModelType<typeof optionalModel>>().toEqualTypeOf<string | undefined>();

        const nullableModel = createModel(oneOf(z.string().nullable(), v.nullable(v.string()), type('string | null')));
        expectTypeOf<InferModelType<typeof nullableModel>>().toEqualTypeOf<string | null>();

        const zodUserSchema = z.string().brand('ZodUser');
        const valibotUserSchema = v.pipe(v.string(), v.brand('ValibotUser'));
        const arkTypeUserSchema = type('string#ArkTypeUser');

        const brandedModel = createModel(oneOf(zodUserSchema, valibotUserSchema, arkTypeUserSchema));
        expectTypeOf<InferModelType<typeof brandedModel>>().toExtend<string>();
        expectTypeOf<InferModelType<typeof brandedModel>>().toEqualTypeOf<
          (string & z.$brand<'ZodUser'>) | (string & v.Brand<'ValibotUser'>) | typeof arkTypeUserSchema.infer
        >();
      });
    });
  });

  describe('createModel', () => {
    const NonEmptyString = createModel(
      oneOf(z.string().min(1), v.pipe(v.string(), v.minLength(1)), type('string > 0')),
    );

    type Email = InferModelType<typeof Email>;
    const Email = createModel(
      oneOf(z.email().brand('Email'), v.pipe(v.string(), v.email(), v.brand('Email')), type('string.email#Email')),
    );

    it('creates a model with given schema', () => {
      const zodStringSchema = z.string();
      const zodModel = createModel(zodStringSchema);
      expect(zodModel.schema).toBe(zodStringSchema);
      expectTypeOf(zodModel.schema).toEqualTypeOf<z.ZodString>();

      const valibotStringSchema = v.string();
      const valibotModel = createModel(valibotStringSchema);
      expect(valibotModel.schema).toBe(valibotStringSchema);
      expectTypeOf(valibotModel.schema).toEqualTypeOf<typeof valibotStringSchema>();

      const arkTypeStringSchema = type('string');
      const arkTypeModel = createModel(arkTypeStringSchema);
      expect(arkTypeModel.schema).toBe(arkTypeStringSchema);
      expectTypeOf(arkTypeModel.schema).toEqualTypeOf<typeof arkTypeStringSchema>();
    });

    it('throws error for promise schemas when used', () => {
      expect(() => createModel(z.string().refine(async () => true)).is('x')).toThrow(TypeError);
      expect(() => createModel(v.pipeAsync(v.string())).is('x')).toThrow(TypeError);
    });

    describe('is', () => {
      it('returns true when value matches the model schema', () => {
        expect(Email.is('correct@email.com')).toBe(true);
        expect(Email.is('another-email@example.com')).toBe(true);
      });

      it('returns false when value does not match the model schema', () => {
        expect(Email.is('incorrect-email')).toBe(false);
        expect(Email.is(123)).toBe(false);
        expect(Email.is(null)).toBe(false);
        expect(Email.is(undefined)).toBe(false);
        expect(Email.is({})).toBe(false);
        expect(Email.is([])).toBe(false);
      });

      it('serves as a type guard for the model schema', () => {
        expectTypeOf(Email.is).guards.toBeString();

        const value = Math.random() > 0.5 ? 'hello' : 123;

        if (NonEmptyString.is(value)) {
          expect(value).toBe('hello');
          expectTypeOf(value).toEqualTypeOf<string>();
        } else {
          expect(value).toBe(123);
          expectTypeOf(value).toEqualTypeOf<number>();
        }
      });
    });

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

    describe('extend', () => {
      it('extends the model with additional properties', () => {
        const baseModel = NonEmptyString;
        const extendedModel = baseModel.extend({
          customProperty: 'custom',
          customMethod: () => 'custom',
        });

        expect(extendedModel.customProperty).toBe('custom');
        expect(extendedModel.customMethod()).toBe('custom');
        expect(extendedModel.schema).toBe(baseModel.schema);
        expectTypeOf(extendedModel.customProperty).toEqualTypeOf<'custom'>();
        expectTypeOf(extendedModel.customMethod).toEqualTypeOf<() => 'custom'>();
      });

      it('can override existing properties', () => {
        const baseModel = NonEmptyString;
        const extendedModel = baseModel.extend({
          is: (value: string) => `yes it is ${value}`,
        });

        expect(baseModel.is('custom')).toBe(true);
        expect(extendedModel.is('custom')).toBe('yes it is custom');

        expectTypeOf(baseModel.is).toEqualTypeOf<(value: unknown) => value is string>();
        expectTypeOf(extendedModel.is).toEqualTypeOf<(value: string) => string>();
      });

      it('can access current model data and methods', () => {
        const baseModel = Email;
        const extendedModel = baseModel.extend((current) => ({
          isLongEmail: (value: string) => current.is(value) && value.length > 15,
        }));

        expect(baseModel.is('correct-long@email.com')).toBe(true);
        expect(baseModel.is('short@mail.com')).toBe(true);
        expect(baseModel.is('invalid-but-long-string')).toBe(false);

        expect(extendedModel.isLongEmail('correct-long@email.com')).toBe(true);
        expect(extendedModel.isLongEmail('short@mail.com')).toBe(false);
        expect(extendedModel.isLongEmail('invalid-but-long-string')).toBe(false);
      });

      it('disables further model extensions when receiving false as an argument', () => {
        const baseModel = NonEmptyString;
        const extendedModel = baseModel.extend(false);

        expect(baseModel).toHaveProperty('extend');
        expect(extendedModel).not.toHaveProperty('extend');
      });
    });
  });
});
