import { type } from 'arktype';
import * as v from 'valibot';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import { ModelValidationError } from './error.js';
import { createModel, type InferModelType } from './index.js';

function oneOf<const T extends unknown[]>(...values: T): T[number] {
  return values[Math.floor(Math.random() * values.length)];
}

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

    describe('is', () => {
      it('returns true when value matches the model schema', () => {
        const schema = oneOf(z.email(), v.pipe(v.string(), v.email()), type('string.email'));
        const model = createModel(schema);

        expect(model.is('correct@email.com')).toBe(true);
        expect(model.is('another-email@example.com')).toBe(true);
      });

      it('returns false when value does not match the model schema', () => {
        const schema = oneOf(z.email(), v.pipe(v.string(), v.email()), type('string.email'));
        const model = createModel(schema);

        expect(model.is('incorrect-email')).toBe(false);
        expect(model.is(123)).toBe(false);
        expect(model.is(null)).toBe(false);
        expect(model.is(undefined)).toBe(false);
        expect(model.is({})).toBe(false);
        expect(model.is([])).toBe(false);
      });

      it('serves as a type guard for the model schema', () => {
        const schema = oneOf(z.string(), v.string(), type('string'));
        const model = createModel(schema);

        expectTypeOf(model.is).guards.toBeString();

        const value = Math.random() > 0.5 ? 'hello' : 123;

        if (model.is(value)) {
          expect(value).toBe('hello');
          expectTypeOf(value).toEqualTypeOf<string>();
        } else {
          expect(value).toBe(123);
          expectTypeOf(value).toEqualTypeOf<number>();
        }
      });
    });

    describe('from', () => {
      type Email = InferModelType<typeof Email>;
      const Email = createModel(
        oneOf(z.email().brand('Email'), v.pipe(v.string(), v.email(), v.brand('Email')), type('string.email#Email')),
      );

      it('creates a model from a value if it matches the model schema', () => {
        const email = Email.from('correct@email.com');
        expect(email).toBe('correct@email.com');
        expectTypeOf(email).toEqualTypeOf<Email>();
      });

      it('throws a ModelValidationError when the value does not match the model schema', () => {
        expect(() => Email.from('incorrect-email')).toThrow(ModelValidationError);
        expect(() => Email.from('')).toThrow(ModelValidationError);
      });

      it('accepts only model schema input types as value', () => {
        const model = createModel(z.string());

        // @ts-expect-error - incorrect type
        expect(() => model.from(123)).toThrow(ModelValidationError);
        // @ts-expect-error - incorrect type
        expect(() => model.from(null)).toThrow(ModelValidationError);
        // @ts-expect-error - incorrect type
        expect(() => model.from({})).toThrow(ModelValidationError);
      });
    });

    describe('cast', () => {
      type Email = InferModelType<typeof Email>;
      const Email = createModel(
        oneOf(z.email().brand('Email'), v.pipe(v.string(), v.email(), v.brand('Email')), type('string.email#Email')),
      );

      it('casts a value to the model schema', () => {
        const email = Email.cast('correct@email.com');
        expect(email).toBe('correct@email.com');
        expectTypeOf(email).toEqualTypeOf<Email>();
      });

      it('throws a ModelValidationError when the value does not match the model schema', () => {
        expect(() => Email.cast('incorrect-email')).toThrow(ModelValidationError);
        expect(() => Email.cast('')).toThrow(ModelValidationError);
      });

      it('accepts any value as input', () => {
        expect(() => Email.cast(123)).toThrow(ModelValidationError);
        expect(() => Email.cast(null)).toThrow(ModelValidationError);
        expect(() => Email.cast({})).toThrow(ModelValidationError);
      });
    });
  });
});
