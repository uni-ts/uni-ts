import type { Err, UnknownResult } from '@uni-ts/result';
import { err } from '@uni-ts/result';
import { ThrownActionError } from './error.js';
import type { Ctx } from './helpers.js';
import { SafeActionBuilder } from './safe-action-builder.js';

/**
 * Creates a new safe action builder for composing middleware and action functions that return Results.
 *
 * Unlike createAction, it'ss designed to work with functions that return Result<T, E> types,
 * providing type-safe error handling without exceptions.
 *
 * @template Input - The input type that will be passed to the action when executed.
 * @template ExceptionHandler - Function type that converts exceptions to Result types. Should return `Ok<T>` or `Err<E>`.
 * @param options - Configuration options for the safe action
 * @param options.onThrow - Optional custom exception handler for thrown exceptions
 * @returns A new SafeActionBuilder instance
 *
 * @example
 * ```typescript
 * const action = createAction<{ token: string }>({ onThrow: console.error })
 *   .with(async ({ input }) => {
 *     const session = await getSession(input.token);
 *     if (!session) return err('SESSION_NOT_FOUND');
 *     return next({ session });
 *   })
 *   .with(async ({ ctx }) => {
 *     const user = await getUser(ctx.session.userId);
 *     if (!user) return err('USER_NOT_FOUND');
 *     return next({ user });
 *   })
 *   .do(async ({ ctx }) => {
 *     const blogPosts = await getBlogPosts(ctx.user.id);
 *     return ok(blogPosts ?? []);
 *   });
 *
 * const result = await action({ token: 'test' });
 *
 * if (isOk(result)) {
 *   console.log(result.data); // BlogPost[]
 * } else {
 *   console.log(result.error); // "SESSION_NOT_FOUND" | "USER_NOT_FOUND"
 * }
 * ```
 */
export function createSafeAction<
  Input = never,
  ExceptionHandler extends (ex: unknown) => UnknownResult = typeof defaultActionExceptionHandler,
>({ onThrow }: { onThrow?: ExceptionHandler } = {}) {
  return new SafeActionBuilder<Input, never, never, Ctx, false, ExceptionHandler>(
    [],
    (onThrow ?? defaultActionExceptionHandler) as ExceptionHandler,
  );
}

/**
 * Default exception handler for safe actions that converts thrown exceptions into Error Results.
 *
 * This handler catches any exceptions that occur during safe action execution and wraps
 * them in a ThrownActionError, then returns them as an Err Result instead of re-throwing.
 * This ensures that safe actions never throw exceptions and always return Results.
 *
 * @param ex - The exception that was thrown
 * @returns An Err Result containing a ThrownActionError
 *
 * @example
 * ```typescript
 * const result = await createSafeAction()
 *   .do(() => {
 *     throw new Error('Something went wrong');
 *   });
 *
 * if (isErr(result)) {
 *   console.log(result.error); // ThrownActionError
 * }
 * ```
 */
export function defaultActionExceptionHandler(ex: unknown): Err<ThrownActionError> {
  return err(new ThrownActionError(ex));
}

export { next } from './helpers.js';
export { ThrownActionError };
