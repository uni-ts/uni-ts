import { describe, expect, expectTypeOf, it } from 'vitest';
import { ThrownActionError } from './error.js';
import { createAction, defaultActionExceptionHandler, next } from './index.js';

describe('index.ts', () => {
  function expectActionError(action: () => unknown, message: string) {
    const onCatch = (ex: unknown) => {
      expect(ex).toBeInstanceOf(ThrownActionError);
      expect((ex as ThrownActionError).message).toBe(message);
    };

    try {
      const result = action();

      if (result instanceof Promise) {
        return result.catch(onCatch);
      }
    } catch (ex) {
      onCatch(ex);
    }
  }

  describe('createAction', () => {
    it('creates an action instance with expected properties', () => {
      const action = createAction();
      expect(action).toHaveProperty('with');
      expect(action).toHaveProperty('do');
      expect(typeof action.with).toBe('function');
      expect(typeof action.do).toBe('function');
    });

    it('accepts input type parameter', () => {
      const action = createAction<{ name: string; age: number }>()
        .with(({ input }) => {
          expectTypeOf(input.name).toBeString();
          expectTypeOf(input.age).toBeNumber();
          return next();
        })
        .do(({ input }) => {
          expectTypeOf(input.name).toBeString();
          expectTypeOf(input.age).toBeNumber();
          return null;
        });

      expect(action({ name: 'John', age: 30 })).toBe(null);
      expectTypeOf(action).toEqualTypeOf<(input: { name: string; age: number }) => null>();
    });

    it('works with no input when its type is not specified', () => {
      const action = createAction()
        .with(({ input }) => {
          expectTypeOf(input).toEqualTypeOf<never>();
          return next();
        })
        .do(({ input }) => {
          expectTypeOf(input).toEqualTypeOf<never>();
          return null;
        });

      expect(action()).toBe(null);
      expectTypeOf(action).toEqualTypeOf<() => null>();
    });

    it('has the default exception handler', () => {
      const action = createAction()
        .with(() => {
          throw new Error('test error');
        })
        .do(() => 'success');

      expectActionError(action, 'test error');
      expectTypeOf(action).toEqualTypeOf<() => 'success'>();
    });

    it('uses custom exception handler when provided', () => {
      const action = createAction({
        onThrow: (ex) => {
          throw new Error(`[Custom] ${String(ex)}`);
        },
      })
        .with(() => {
          throw new Error('test error');
        })
        .do(() => 'success');

      expect(() => action()).toThrow('[Custom] Error: test error');
      expectTypeOf(action).toEqualTypeOf<() => 'success'>();
    });
  });

  describe('middleware', () => {
    it('executes middleware in sequential order', () => {
      const executionOrder: string[] = [];

      const action = createAction()
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
          return 'success';
        });

      expect(action()).toEqual('success');
      expect(executionOrder).toEqual(['middleware1', 'middleware2', 'action']);
    });

    it('short-circuits on middleware error and skips subsequent middleware', () => {
      const executionOrder: string[] = [];

      const action = createAction()
        .with(() => {
          executionOrder.push('middleware1');
          return next();
        })
        .with(() => {
          executionOrder.push('middleware2');
          throw new Error('ERROR_IN_MIDDLEWARE');
        })
        .with(() => {
          executionOrder.push('middleware3');
          return next();
        })
        .do(() => {
          executionOrder.push('action');
          return 'Should not reach here';
        });

      expectActionError(action, 'ERROR_IN_MIDDLEWARE');
      expect(executionOrder).toEqual(['middleware1', 'middleware2']);
      expect(executionOrder).not.toContain('middleware3');
      expect(executionOrder).not.toContain('action');
    });

    it('works with no middleware', () => {
      const action = createAction().do(() => 'direct action');

      expect(action()).toBe('direct action');
    });

    it('allows middleware to return non-context values', () => {
      const action = createAction()
        .with(() => 'early return')
        .do(() => 'Should not reach here');

      expect(action()).toBe('early return');
      expectTypeOf(action).toEqualTypeOf<() => 'early return' | 'Should not reach here'>();
    });
  });

  describe('context', () => {
    it('starts with empty context', () => {
      const action = createAction().do(({ ctx }) => {
        expect(ctx).toEqual({});
        // biome-ignore lint/complexity/noBannedTypes: fine as type assertion
        expectTypeOf(ctx).toEqualTypeOf<{}>();
        return 'success';
      });

      expect(action()).toBe('success');
      expectTypeOf(action).toEqualTypeOf<() => 'success'>();
    });

    it('infers complex types from middleware and action', () => {
      const random = Math.random();

      const action = createAction<{ value: number }>()
        .with(() => (random ? next({ ctx1: 1 }) : next({ ctx1: 'a' })))
        .with(() => next({ ctx3: true }))
        .with(() => (random ? next() : { foo: 'bar' }))
        .do(({ ctx }) => {
          expectTypeOf(ctx).toEqualTypeOf<Readonly<{ ctx1: 1; ctx3: true } | { ctx1: 'a'; ctx3: true }>>();

          return random ? 123 : 'abc';
        });

      expectTypeOf(action({ value: 1 })).toEqualTypeOf<{ foo: string } | 123 | 'abc'>();
    });

    it('merges context from multiple middlewares', () => {
      const action = createAction()
        .with(() => next({ first: 1 }))
        .with(() => next({ second: 'two' }))
        .with(() => next({ third: true }))
        .do(({ ctx }) => {
          expect(ctx.first).toBe(1);
          expect(ctx.second).toBe('two');
          expect(ctx.third).toBe(true);
          expectTypeOf(ctx).toEqualTypeOf<Readonly<{ first: 1; second: 'two'; third: true }>>();

          return ctx;
        });

      expect(action()).toEqual({ first: 1, second: 'two', third: true });
      expectTypeOf(action).toEqualTypeOf<() => Readonly<{ first: 1; second: 'two'; third: true }>>();
    });

    it('overrides context properties with later middleware values', () => {
      const action = createAction()
        .with(() => next({ value: 'initial' }))
        .with(() => next({ otherValue: 42 }))
        .with(() => next({ value: 'overridden' }))
        .do(({ ctx }) => {
          expect(ctx.value).toBe('overridden');
          expect(ctx.otherValue).toBe(42);
          expectTypeOf(ctx).toEqualTypeOf<Readonly<{ value: 'overridden'; otherValue: 42 }>>();

          return ctx;
        });

      expect(action()).toEqual({ value: 'overridden', otherValue: 42 });
      expectTypeOf(action).toEqualTypeOf<() => Readonly<{ value: 'overridden'; otherValue: 42 }>>();
    });
  });

  describe('async', () => {
    it('returns promise when middleware is async', async () => {
      const action = createAction()
        .with(async () => next({ asyncValue: 'from middleware' }))
        .do(({ ctx }) => {
          expect(ctx.asyncValue).toBe('from middleware');
          return 'success';
        });

      expect(await action()).toBe('success');
      expectTypeOf(action).toEqualTypeOf<() => Promise<'success'>>();
    });

    it('returns promise when action is async', async () => {
      const action = createAction()
        .with(() => next({ syncValue: 'from middleware' }))
        .do(async ({ ctx }) => {
          expect(ctx.syncValue).toBe('from middleware');
          return 'async result';
        });

      expect(await action()).toBe('async result');
      expectTypeOf(action).toEqualTypeOf<() => Promise<string>>();
    });

    it('processes mix of sync and async middleware correctly', async () => {
      const executionOrder: string[] = [];

      const action = createAction()
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
          return null;
        });

      await action();

      expect(executionOrder).toEqual(['sync1', 'async1-start', 'async1-end', 'sync2', 'action-start', 'action-end']);
    });

    it('short-circuits on async middleware error', async () => {
      const executionOrder: string[] = [];

      const action = createAction()
        .with(() => {
          executionOrder.push('sync1');
          return next();
        })
        .with(async () => {
          executionOrder.push('async1');
          throw new Error('ERROR_IN_ASYNC_MIDDLEWARE');
        })
        .with(() => {
          executionOrder.push('sync2');
          return next();
        })
        .do(() => {
          executionOrder.push('action');
          return 'Should not reach here';
        });

      await expect(() => action()).rejects.toThrow('ERROR_IN_ASYNC_MIDDLEWARE');
      expect(executionOrder).toEqual(['sync1', 'async1']);
      expect(executionOrder).not.toContain('sync2');
      expect(executionOrder).not.toContain('action');
    });
  });

  describe('errors', () => {
    it('handles synchronous middleware errors', () => {
      const action = createAction()
        .with(() => {
          throw new Error('Middleware error');
        })
        .do(() => null);

      expectActionError(action, 'Middleware error');
      expectTypeOf(action).toEqualTypeOf<() => null>();
    });

    it('handles asynchronous middleware errors', async () => {
      const action = createAction()
        .with(async () => {
          throw new Error('Async middleware error');
        })
        .do(() => null);

      await expectActionError(action, 'Async middleware error');
      expectTypeOf(action).toEqualTypeOf<() => Promise<null>>();
    });

    it('handles synchronous action errors', () => {
      const action = createAction().do(() => {
        throw new Error('Action error');
      });

      expectActionError(action, 'Action error');
      expectTypeOf(action).toEqualTypeOf<() => never>();
    });

    it('handles asynchronous action errors', async () => {
      const action = createAction().do(async () => {
        throw new Error('Async action error');
      });

      await expectActionError(action, 'Async action error');
      expectTypeOf(action).toEqualTypeOf<() => Promise<never>>();
    });

    it('uses custom error handler when provided', () => {
      const action = createAction({
        onThrow: (ex) => {
          throw new Error(`[Custom] ${String(ex)}`);
        },
      })
        .with(() => {
          throw new Error('Test error');
        })
        .do(() => null);

      expect(() => action()).toThrow('[Custom] Error: Test error');
      expectTypeOf(action).toEqualTypeOf<() => null>();
    });

    it('allows to make action non-throwable for unexpected errors', () => {
      const action = createAction({
        onThrow: () => 'HAS_SOME_ERROR' as const,
      })
        .with(() => {
          throw new Error('Test error');
        })
        .do(() => null);

      expect(action()).toBe('HAS_SOME_ERROR');
      expectTypeOf(action).toEqualTypeOf<() => 'HAS_SOME_ERROR' | null>();
    });
  });

  describe('defaultActionExceptionHandler', () => {
    it('wraps error with [Action] prefix', () => {
      expectActionError(() => defaultActionExceptionHandler(new Error('original message')), 'original message');
    });

    it('handles non-Error objects', () => {
      expectActionError(() => defaultActionExceptionHandler('string error'), 'string error');
    });
  });
});
