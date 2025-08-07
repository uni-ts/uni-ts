import type { Err, Ok, Result, UnknownResult, UnwrapErr, UnwrapOk } from '@uni-ts/result';
import type {
  ActionExecutor,
  ActionFn,
  ActionResponse,
  Ctx,
  CtxValue,
  IsAsync,
  Merge,
  MiddlewareFn,
  OrPromise,
  UnwrapCtx,
} from './helpers.js';
import { createActionExecutor } from './helpers.js';

/**
 * Builder class for composing middleware and action functions that return Result types.
 *
 * Unlike the regular ActionBuilder, SafeActionBuilder is designed to work with functions
 * that return Result<T, E> types, providing type-safe error handling without exceptions.
 *
 * @template Input - The input type that will be passed to the action when executed. Use `never` if no input is required.
 * @template CurrentOk - Union type of all possible success values from middleware functions. Accumulated as middleware is added.
 * @template CurrentErr - Union type of all possible error values from middleware functions. Accumulated as middleware is added.
 * @template Context - The context object type containing data passed between middleware. Extends from base `Ctx` type.
 * @template Async - Boolean literal type tracking whether any middleware or action returns a Promise.
 * @template ExceptionHandler - Function type that converts exceptions to Result types. Should return `Ok<T>` or `Err<E>`.
 */
export class SafeActionBuilder<
  Input,
  CurrentOk,
  CurrentErr,
  Context extends Ctx,
  Async extends boolean,
  ExceptionHandler extends (ex: unknown) => unknown,
> {
  constructor(
    private readonly fns: MiddlewareFn<Input, OrPromise<UnknownResult | Ctx>, Ctx>[],
    private readonly handleException: ExceptionHandler,
  ) {}

  /**
   * Adds a middleware function to the safe action pipeline.
   *
   * The middleware function should return either a Result type (via `ok()` or `err()`) for data processing
   * or a context object (via `next()`) for passing data to subsequent middleware.
   *
   * @template MiddlewareOutput - The return type of the middleware function. Must be `Ok<T>`, `Err<E>`, Promise thereof, or context via `next()`.
   * @param fn - The middleware function that returns a Result or context
   * @returns A new SafeActionBuilder instance with the middleware added
   *
   * @example
   * ```typescript
   * const action = createSafeAction<{ token: string }>()
   *   .with(async ({ input }) => {
   *     const session = await getSession(input.token);
   *     if (!session) return err('SESSION_NOT_FOUND');
   *     return next({ session });
   *   })
   *   .with(({ ctx }) => {
   *     const user = await getUser(ctx.session.userId);
   *     if (!user) return err('USER_NOT_FOUND');
   *     return next({ user });
   *   })
   *   .do(...);
   *
   * const result = await action({ token: 'test' });
   * ```
   */
  with<MiddlewareOutput extends OrPromise<UnknownResult | Ctx<object>> = never>(
    fn: MiddlewareFn<Input, MiddlewareOutput, Context>,
  ) {
    return new SafeActionBuilder<
      Input,
      CurrentOk | UnwrapOk<MiddlewareOutput>,
      CurrentErr | UnwrapErr<MiddlewareOutput>,
      Ctx<Merge<CtxValue<Context>, CtxValue<UnwrapCtx<MiddlewareOutput>>>>,
      IsAsync<Async, MiddlewareOutput>,
      ExceptionHandler
    >([...this.fns, fn], this.handleException);
  }

  /**
   * Adds the final action function and creates an executable safe action.
   *
   * The action function should return a Result type representing the final outcome.
   *
   * @template ActionOutput - The return type of the final action function. Must be `Ok<T>`, `Err<E>`, or Promise thereof.
   * @param actionFn - The final action function that returns a Result (`ok()` or `err()`)
   * @returns An executable safe action that returns a Result when called
   *
   * @example
   * ```typescript
   * const action = createSafeAction<{ token: string }>()
   *   .with(getSession)
   *   .with(getUser)
   *   .do(async ({ ctx }) => {
   *     const blogPosts = await getBlogPosts(ctx.user.id);
   *     return ok(blogPosts ?? []);
   *   });
   *
   * const result = await action({ token: 'test' });
   * // Result<BlogPost[], 'SESSION_NOT_FOUND' | 'USER_NOT_FOUND' | ThrownActionError>
   * ```
   */
  do<ActionOutput extends OrPromise<UnknownResult> = never>(actionFn: ActionFn<Input, ActionOutput, Context>) {
    const actionExecutor = createActionExecutor(this.fns, this.handleException, actionFn);

    return actionExecutor as ActionExecutor<
      Input,
      ActionResponse<
        IsAsync<Async, ActionOutput>,
        Result<
          CurrentOk | UnwrapOk<ActionOutput> | InferCatchOk<ExceptionHandler>,
          CurrentErr | UnwrapErr<ActionOutput> | InferCatchErr<ExceptionHandler>
        >
      >
    >;
  }
}

type InferCatchOk<T> = T extends (ex: unknown) => Ok<infer O> ? O : never;

type InferCatchErr<T> = T extends (ex: unknown) => Err<infer E> ? E : never;
