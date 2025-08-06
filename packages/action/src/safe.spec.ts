import type { Result } from '@uni-ts/result';
import { err, ok } from '@uni-ts/result';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSafeAction, next } from './safe.js';

describe('utils / action', () => {
  describe('createSafeAction', () => {
    it('creates an action instance with expected properties', () => {
      const action = createSafeAction();
      expect(action).toHaveProperty('with');
      expect(action).toHaveProperty('do');
    });

    it('accepts input type parameter', () => {
      const action = createSafeAction<{ name: string; age: number }>()
        .with(({ input }) => {
          expectTypeOf(input.name).toBeString();
          expectTypeOf(input.age).toBeNumber();
          return next();
        })
        .do(({ input }) => {
          expectTypeOf(input.name).toBeString();
          expectTypeOf(input.age).toBeNumber();
          return ok(null);
        });

      expectTypeOf(action).toEqualTypeOf<(input: { name: string; age: number }) => Result<null, 'UNHANDLED_ERROR'>>();
    });
  });

  describe('with (middleware)', () => {
    it('invokes middleware in the correct sequential order', () => {
      const executionOrder: string[] = [];

      const action = createSafeAction()
        .with(() => {
          executionOrder.push('middleware1');
          return next();
        })
        .with(() => {
          executionOrder.push('middleware2');
          return next();
        })
        .do(() => {
          executionOrder.push('action');
          return ok(null);
        });

      action();
      expect(executionOrder).toEqual(['middleware1', 'middleware2', 'action']);
    });

    it('short-circuits on middleware error and skips subsequent middleware', () => {
      const executionOrder: string[] = [];

      const action = createSafeAction()
        .with(() => {
          executionOrder.push('middleware1');
          return next();
        })
        .with(() => {
          executionOrder.push('middleware2');
          return err('ERROR_IN_MIDDLEWARE');
        })
        .with(() => {
          executionOrder.push('middleware3');
          return next();
        })
        .do(() => {
          executionOrder.push('action');
          return ok('Should not reach here');
        });

      const result = action();

      expect(result).toEqual(err('ERROR_IN_MIDDLEWARE'));
      expect(executionOrder).toEqual(['middleware1', 'middleware2']);
      expect(executionOrder).not.toContain('middleware3');
      expect(executionOrder).not.toContain('action');
    });
  });

  describe('context', () => {
    it('infers complex types from middleware and action', () => {
      const random = Math.random();

      const action = createSafeAction<{ value: number }>()
        .with(() => (random ? next({ ctxA: 1 }) : next({ ctxB: 'a' })))
        .with(() => next({ ctxC: true }))
        .with(() => (random ? next() : random ? err({ errA: 2 }) : err({ errB: 'b' })))
        .do(({ ctx }) => {
          expectTypeOf(ctx).toEqualTypeOf<
            { readonly ctxA: 1; readonly ctxC: true } | { readonly ctxB: 'a'; readonly ctxC: true }
          >();

          return random ? ok({ okA: 3 }) : ok({ okB: 'c' });
        });

      const result = action({ value: 1 });

      expectTypeOf(result).toEqualTypeOf<
        Result<
          { readonly okA: 3 } | { readonly okB: 'c' },
          'UNHANDLED_ERROR' | { readonly errA: 2 } | { readonly errB: 'b' }
        >
      >();
    });

    it('preserves and merges context from multiple middlewares', () => {
      const action = createSafeAction()
        .with(() => next({ first: 1 }))
        .with(() => next({ second: 'two' }))
        .with(() => next({ third: true }))
        .do(({ ctx }) => {
          expect(ctx.first).toBe(1);
          expect(ctx.second).toBe('two');
          expect(ctx.third).toBe(true);

          expectTypeOf(ctx).toEqualTypeOf<{ readonly first: 1; readonly second: 'two'; readonly third: true }>();

          return ok(ctx);
        });

      const result = action();
      expect(result).toEqual(ok({ first: 1, second: 'two', third: true }));
    });

    it('overrides context properties with the same name from later middleware', () => {
      const action = createSafeAction()
        .with(() => next({ value: 'initial string' }))
        .with(() => next({ otherValue: 42 }))
        .with(() => next({ value: 'overridden value' }))
        .do(({ ctx }) => {
          expect(ctx.value).toBe('overridden value');
          expect(ctx.otherValue).toBe(42);
          expectTypeOf(ctx).toEqualTypeOf<{ readonly value: 'overridden value'; readonly otherValue: 42 }>();

          return ok(ctx);
        });

      const result = action();
      expect(result).toEqual(ok({ value: 'overridden value', otherValue: 42 }));
    });
  });

  describe('async', () => {
    it('returns a promise when any middleware returns a promise', async () => {
      const action = createSafeAction()
        .with(async () => {
          await Promise.resolve();
          return next({ asyncValue: 'from middleware' });
        })
        .do(() => ok('success'));

      const result = await action();

      expect(result).toEqual(ok('success'));
      expectTypeOf(action).toEqualTypeOf<() => Promise<Result<'success', 'UNHANDLED_ERROR'>>>();
    });

    it('returns a promise when action returns a promise', async () => {
      const action = createSafeAction()
        .with(() => next({ syncValue: 'from middleware' }))
        .do(async () => {
          await Promise.resolve();
          return ok('async result');
        });

      const result = await action();

      expect(result).toEqual(ok('async result'));
      expectTypeOf(action).toEqualTypeOf<() => Promise<Result<'async result', 'UNHANDLED_ERROR'>>>();
    });

    it('correctly processes a mix of sync and async middleware', async () => {
      const executionOrder: string[] = [];

      const action = createSafeAction()
        .with(() => {
          executionOrder.push('sync1');
          return next();
        })
        .with(async () => {
          executionOrder.push('async1-start');
          await new Promise((resolve) => setTimeout(resolve, 0));
          executionOrder.push('async1-end');
          return next();
        })
        .with(() => {
          executionOrder.push('sync2');
          return next();
        })
        .do(async () => {
          executionOrder.push('action-start');
          await Promise.resolve();
          executionOrder.push('action-end');
          return ok(null);
        });

      await action();

      expect(executionOrder).toEqual(['sync1', 'async1-start', 'async1-end', 'sync2', 'action-start', 'action-end']);
    });

    it('short-circuits on async middleware error and skips subsequent middleware', async () => {
      const executionOrder: string[] = [];

      const action = createSafeAction()
        .with(() => {
          executionOrder.push('sync1');
          return next();
        })
        .with(async () => {
          executionOrder.push('async1');
          await Promise.resolve();
          return err('ERROR_IN_ASYNC_MIDDLEWARE');
        })
        .with(() => {
          executionOrder.push('sync2');
          return next();
        })
        .do(() => {
          executionOrder.push('action');
          return ok('Should not reach here');
        });

      const result = await action();

      expect(result).toEqual(err('ERROR_IN_ASYNC_MIDDLEWARE'));
      expect(executionOrder).toEqual(['sync1', 'async1']);
      expect(executionOrder).not.toContain('sync2');
      expect(executionOrder).not.toContain('action');
    });

    it('short-circuits when subsequent async middleware returns an error', async () => {
      const executionOrder: string[] = [];

      const action = createSafeAction()
        .with(async () => {
          executionOrder.push('async1');
          await Promise.resolve();
          return next({ value: 'first' });
        })
        .with(async () => {
          executionOrder.push('async2');
          await Promise.resolve();
          return err('ERROR_IN_SUBSEQUENT_ASYNC');
        })
        .with(async () => {
          executionOrder.push('async3');
          await Promise.resolve();
          return next();
        })
        .do(() => {
          executionOrder.push('action');
          return ok('Should not reach here');
        });

      const result = await action();

      expect(result).toEqual(err('ERROR_IN_SUBSEQUENT_ASYNC'));
      expect(executionOrder).toEqual(['async1', 'async2']);
      expect(executionOrder).not.toContain('async3');
      expect(executionOrder).not.toContain('action');
    });
  });

  describe('errors', () => {
    it('handles synchronous middleware errors', () => {
      const action = createSafeAction()
        .with(() => {
          throw new Error('Middleware error');
        })
        .do(() => ok(null));

      const result = action();

      expect(result).toEqual(err('UNHANDLED_ERROR'));
      expectTypeOf(action).toEqualTypeOf<() => Result<null, 'UNHANDLED_ERROR'>>();
    });

    it('handles asynchronous middleware errors', async () => {
      const action = createSafeAction()
        .with(async () => {
          await Promise.resolve();
          throw new Error('Async middleware error');
        })
        .do(() => ok(null));

      const result = await action();

      expect(result).toEqual(err('UNHANDLED_ERROR'));
      expectTypeOf(action).toEqualTypeOf<() => Promise<Result<null, 'UNHANDLED_ERROR'>>>();
    });

    it('handles synchronous action errors', () => {
      const action = createSafeAction().do(() => {
        throw new Error('Action error');
      });

      const result = action();

      expect(result).toEqual(err('UNHANDLED_ERROR'));
      expectTypeOf(action).toEqualTypeOf<() => Result<never, 'UNHANDLED_ERROR'>>();
    });

    it('handles asynchronous action errors', async () => {
      const action = createSafeAction().do(async () => {
        await Promise.resolve();
        throw new Error('Async action error');
      });

      const result = await action();

      expect(result).toEqual(err('UNHANDLED_ERROR'));
      expectTypeOf(action).toEqualTypeOf<() => Promise<Result<never, 'UNHANDLED_ERROR'>>>();
    });

    it('uses custom error handler when provided', () => {
      const customErrorMessage = 'CUSTOM_ERROR';

      const action = createSafeAction({ onThrow: () => err(customErrorMessage) })
        .with(() => {
          throw new Error('Test error');
        })
        .do(() => ok(null));

      const result = action();

      expect(result).toEqual(err(customErrorMessage));
      expectTypeOf(action).toEqualTypeOf<() => Result<null, 'CUSTOM_ERROR'>>();
    });

    it('allows to make action throwable for unexpected errors', () => {
      const customErrorMessage = 'CUSTOM_ERROR';

      const action = createSafeAction({
        onThrow: () => {
          throw new Error(customErrorMessage);
        },
      })
        .with(() => {
          throw new Error('Test error');
        })
        .do(() => ok(null));

      expect(() => action()).toThrow(customErrorMessage);
      expectTypeOf(action).toEqualTypeOf<() => Result<null, unknown>>();
    });
  });
});
