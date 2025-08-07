import { ActionBuilder } from './action-builder.js';
import { ThrownActionError } from './error.js';
import type { Ctx } from './helpers.js';

/**
 * Creates a new action builder for composing middleware and action functions.
 *
 * @template Input - The input type that will be passed to the action when executed.
 * @template ExceptionHandler - Function type that handles exceptions thrown during execution. Must return a value or throw.
 * @param options - Configuration options for the action
 * @param options.onThrow - Optional custom exception handler function
 * @returns A new ActionBuilder instance
 *
 * @example
 * ```typescript
 * const action = createAction<{ token: string }>({ onThrow: console.error })
 *   .with(async ({ input }) => {
 *     const session = await getSession(input.token);
 *     if (!session) throw new Error('Session not found');
 *     return next({ session });
 *   })
 *   .with(async ({ ctx }) => {
 *     const user = await getUser(ctx.session.userId);
 *     if (!user) throw new Error('User not found');
 *     return next({ user });
 *   })
 *   .do(async ({ ctx }) => {
 *     const blogPosts = await getBlogPosts(ctx.user.id);
 *     return blogPosts ?? [];
 *   });
 *
 * const result = await action({ token: 'test' });
 * // BlogPost[]
 * ```
 */
export function createAction<
  Input = never,
  ExceptionHandler extends (ex: unknown) => unknown = typeof defaultActionExceptionHandler,
>({ onThrow }: { onThrow?: ExceptionHandler } = {}) {
  return new ActionBuilder<Input, never, Ctx, false, ExceptionHandler>(
    [],
    (onThrow ?? defaultActionExceptionHandler) as ExceptionHandler,
  );
}

/**
 * Default exception handler that wraps thrown errors in ThrownActionError.
 *
 * @param ex - The exception that was thrown
 * @throws {ThrownActionError} Always throws a ThrownActionError wrapping the original exception
 */
export function defaultActionExceptionHandler(ex: unknown): never {
  throw new ThrownActionError(ex);
}

export { next } from './helpers.js';
export { ThrownActionError };
