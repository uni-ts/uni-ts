import type { Err, Result, UnknownResult } from '@uni-ts/result';
import { err, isErr, ok } from '@uni-ts/result';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { ThrownActionError } from './error.js';
import { createSafeAction, defaultActionExceptionHandler, next } from './safe.js';

describe('safe.ts', () => {
  function expectActionError(result: UnknownResult, message: string) {
    expect(isErr(result)).toBe(true);
    expect((result as Err<unknown>).error).toBeInstanceOf(ThrownActionError);
    expect(((result as Err<unknown>).error as ThrownActionError).message).toBe(message);
  }

  describe('createSafeAction', () => {
    it('creates an action instance with expected properties', () => {
      const action = createSafeAction();
      expect(action).toHaveProperty('with');
      expect(action).toHaveProperty('do');
      expect(typeof action.with).toBe('function');
      expect(typeof action.do).toBe('function');
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

      expect(action({ name: 'John', age: 30 })).toEqual(ok(null));
      expectTypeOf(action).toEqualTypeOf<(input: { name: string; age: number }) => Result<null, ThrownActionError>>();
    });

    it('works with no input when its type is not specified', () => {
      const action = createSafeAction()
        .with(({ input }) => {
          expectTypeOf(input).toEqualTypeOf<never>();
          return next();
        })
        .do(({ input }) => {
          expectTypeOf(input).toEqualTypeOf<never>();
          return ok(null);
        });

      expect(action()).toEqual(ok(null));
      expectTypeOf(action).toEqualTypeOf<() => Result<null, ThrownActionError>>();
    });

    it('has the default exception handler', () => {
      const action = createSafeAction()
        .with(() => {
          throw new Error('test error');
        })
        .do(() => ok(null));

      expectActionError(action(), 'test error');
      expectTypeOf(action).toEqualTypeOf<() => Result<null, ThrownActionError>>();
    });

    it('uses custom exception handler when provided', () => {
      const action = createSafeAction({
        onThrow: (ex) => {
          return err(`[Custom] ${String(ex)}`);
        },
      })
        .with(() => {
          throw new Error('test error');
        })
        .do(() => ok(null));

      expect(action()).toEqual(err('[Custom] Error: test error'));
      expectTypeOf(action).toEqualTypeOf<() => Result<null, `[Custom] ${string}`>>();
    });
  });

  describe('middleware', () => {
    it('executes middleware in sequential order', () => {
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
          return ok('success');
        });

      expect(action()).toEqual(ok('success'));
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

      expect(action()).toEqual(err('ERROR_IN_MIDDLEWARE'));
      expect(executionOrder).toEqual(['middleware1', 'middleware2']);
      expect(executionOrder).not.toContain('middleware3');
      expect(executionOrder).not.toContain('action');
    });

    it('works with no middleware', () => {
      const action = createSafeAction().do(() => ok('direct action'));

      expect(action()).toEqual(ok('direct action'));
      expectTypeOf(action).toEqualTypeOf<() => Result<'direct action', ThrownActionError>>();
    });

    it('allows middleware to return non-context values', () => {
      const action = createSafeAction()
        .with(() => ok('early return'))
        .do(() => ok('Should not reach here'));

      expect(action()).toEqual(ok('early return'));
      expectTypeOf(action).toEqualTypeOf<() => Result<'early return' | 'Should not reach here', ThrownActionError>>();
    });
  });

  describe('context', () => {
    it('starts with empty context', () => {
      const action = createSafeAction().do(({ ctx }) => {
        expect(ctx).toEqual({});
        expectTypeOf(ctx).toEqualTypeOf<{}>();
        return ok('success');
      });

      expect(action()).toEqual(ok('success'));
      expectTypeOf(action).toEqualTypeOf<() => Result<'success', ThrownActionError>>();
    });

    it('infers complex types from middleware and action', () => {
      const random = Math.random();

      const action = createSafeAction<{ value: number }>()
        .with(() => (random ? next({ ctx1: 1 }) : next({ ctx2: 'a' })))
        .with(() => next({ ctx3: true }))
        .with(() => (random ? next() : random ? err({ err1: 2 }) : err({ err2: 'b' })))
        .do(({ ctx }) => {
          expectTypeOf(ctx).toEqualTypeOf<Readonly<{ ctx1: 1; ctx3: true } | { ctx2: 'a'; ctx3: true }>>();

          return random ? ok(123) : ok('abc');
        });

      expectTypeOf(action({ value: 1 })).toEqualTypeOf<
        Result<123 | 'abc', ThrownActionError | { readonly err1: 2 } | { readonly err2: 'b' }>
      >();
    });

    it('merges context from multiple middlewares', () => {
      const action = createSafeAction()
        .with(() => next({ first: 1 }))
        .with(() => next({ second: 'two' }))
        .with(() => next({ third: true }))
        .do(({ ctx }) => {
          expect(ctx.first).toBe(1);
          expect(ctx.second).toBe('two');
          expect(ctx.third).toBe(true);
          expectTypeOf(ctx).toEqualTypeOf<Readonly<{ first: 1; second: 'two'; third: true }>>();

          return ok(ctx);
        });

      expect(action()).toEqual(ok({ first: 1, second: 'two', third: true }));
      expectTypeOf(action).toEqualTypeOf<
        () => Result<Readonly<{ first: 1; second: 'two'; third: true }>, ThrownActionError>
      >();
    });

    it('overrides context properties with later middleware values', () => {
      const action = createSafeAction()
        .with(() => next({ value: 'initial' }))
        .with(() => next({ otherValue: 42 }))
        .with(() => next({ value: 'overridden' }))
        .do(({ ctx }) => {
          expect(ctx.value).toBe('overridden');
          expect(ctx.otherValue).toBe(42);
          expectTypeOf(ctx).toEqualTypeOf<Readonly<{ value: 'overridden'; otherValue: 42 }>>();

          return ok(ctx);
        });

      expect(action()).toEqual(ok({ value: 'overridden', otherValue: 42 }));
      expectTypeOf(action).toEqualTypeOf<
        () => Result<Readonly<{ value: 'overridden'; otherValue: 42 }>, ThrownActionError>
      >();
    });
  });

  describe('async', () => {
    it('returns promise when middleware is async', async () => {
      const action = createSafeAction()
        .with(async () => next({ asyncValue: 'from middleware' }))
        .do(({ ctx }) => {
          expect(ctx.asyncValue).toBe('from middleware');
          return ok('success');
        });

      expect(await action()).toEqual(ok('success'));
      expectTypeOf(action).toEqualTypeOf<() => Promise<Result<'success', ThrownActionError>>>();
    });

    it('returns promise when action is async', async () => {
      const action = createSafeAction()
        .with(() => next({ syncValue: 'from middleware' }))
        .do(async ({ ctx }) => {
          expect(ctx.syncValue).toBe('from middleware');
          return ok('async result');
        });

      expect(await action()).toEqual(ok('async result'));
      expectTypeOf(action).toEqualTypeOf<() => Promise<Result<'async result', ThrownActionError>>>();
    });

    it('processes mix of sync and async middleware correctly', async () => {
      const executionOrder: string[] = [];

      const action = createSafeAction()
        .with(() => {
          executionOrder.push('sync1');
          return next();
        })
        .with(async () => {
          executionOrder.push('async1-start');
          await Promise.resolve();
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

    it('short-circuits on async middleware error', async () => {
      const executionOrder: string[] = [];

      const action = createSafeAction()
        .with(() => {
          executionOrder.push('sync1');
          return next();
        })
        .with(async () => {
          executionOrder.push('async1');
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

      expect(await action()).toEqual(err('ERROR_IN_ASYNC_MIDDLEWARE'));
      expect(executionOrder).toEqual(['sync1', 'async1']);
      expect(executionOrder).not.toContain('sync2');
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

      expectActionError(action(), 'Middleware error');
      expectTypeOf(action).toEqualTypeOf<() => Result<null, ThrownActionError>>();
    });

    it('handles asynchronous middleware errors', async () => {
      const action = createSafeAction()
        .with(async () => {
          throw new Error('Async middleware error');
        })
        .do(() => ok(null));

      expectActionError(await action(), 'Async middleware error');
      expectTypeOf(action).toEqualTypeOf<() => Promise<Result<null, ThrownActionError>>>();
    });

    it('handles synchronous action errors', () => {
      const action = createSafeAction().do(() => {
        throw new Error('Action error');
      });

      expectActionError(action(), 'Action error');
      expectTypeOf(action).toEqualTypeOf<() => Result<never, ThrownActionError>>();
    });

    it('handles asynchronous action errors', async () => {
      const action = createSafeAction().do(async () => {
        throw new Error('Async action error');
      });

      expectActionError(await action(), 'Async action error');
      expectTypeOf(action).toEqualTypeOf<() => Promise<Result<never, ThrownActionError>>>();
    });

    it('uses custom error handler when provided', () => {
      const action = createSafeAction({
        onThrow: (ex) => {
          return err(`[Custom] ${String(ex)}`);
        },
      })
        .with(() => {
          throw new Error('Test error');
        })
        .do(() => ok(null));

      expect(action()).toEqual(err('[Custom] Error: Test error'));
      expectTypeOf(action).toEqualTypeOf<() => Result<null, `[Custom] ${string}`>>();
    });

    it('allows to make action throwable for unexpected errors', () => {
      const action = createSafeAction({
        onThrow: () => ok('HAS_SOME_ERROR'),
      })
        .with(() => {
          throw new Error('Test error');
        })
        .do(() => ok(null));

      expect(action()).toEqual(ok('HAS_SOME_ERROR'));
      expectTypeOf(action).toEqualTypeOf<() => Result<'HAS_SOME_ERROR' | null, never>>();
    });
  });

  describe('defaultActionExceptionHandler', () => {
    it('wraps error with [Action] prefix', () => {
      expectActionError(defaultActionExceptionHandler(new Error('original message')), 'original message');
    });

    it('handles non-Error objects', () => {
      expectActionError(defaultActionExceptionHandler('string error'), 'string error');
    });
  });
});
