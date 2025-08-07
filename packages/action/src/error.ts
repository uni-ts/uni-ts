/**
 * Error class for wrapping exceptions thrown during action execution.
 *
 * Preserves the original exception and provides a consistent
 * error type for action-related failures. It extends the native Error class
 * and includes the original exception for debugging purposes.
 *
 * @example
 * ```typescript
 * const action = createAction()
 *   .with(async () => {
 *     const session = await getSession();
 *     if (!session) throw new Error('No session');
 *     return next({ session });
 *   })
 *   .do(async ({ ctx }) => {
 *     return await getUser(ctx.session.userId);
 *   });
 *
 * try {
 *   const user = await action();
 * } catch (ex) {
 *   if (ex instanceof ThrownActionError) {
 *     console.error(ex.originalEx); // Original Error object
 *   }
 * }
 * ```
 */
export class ThrownActionError extends Error {
  /**
   * Used to distinguish this error from others with the same shape.
   */
  readonly type = 'ThrownActionError';

  /**
   * The original exception that was thrown.
   */
  readonly originalEx?: unknown;

  /**
   * Creates a new ThrownActionError with the provided original exception.
   *
   * @param ex - The original exception that was thrown
   */
  constructor(ex: unknown) {
    if (ex instanceof Error) {
      super(ex.message, { cause: ex.cause });
      this.originalEx = ex;
    } else {
      super(String(ex));
    }

    this.name = ThrownActionError.name;
  }
}
