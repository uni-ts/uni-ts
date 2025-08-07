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
 * Builder class for composing middleware and action functions in a type-safe manner.
 *
 * @template Input - The input type that will be passed to the action when executed. Use `never` if no input is required.
 * @template Output - Union type of all possible outputs from middleware functions. Accumulated as middleware is added.
 * @template Context - The context object type containing data passed between middleware. Extends from base `Ctx` type.
 * @template Async - Boolean literal type tracking whether any middleware or action returns a Promise.
 * @template ExceptionHandler - Function type that handles exceptions thrown during execution. Must return a value or throw.
 */
export class ActionBuilder<
  Input,
  Output,
  Context extends Ctx,
  Async extends boolean,
  ExceptionHandler extends (ex: unknown) => unknown,
> {
  constructor(
    private readonly fns: MiddlewareFn<Input, OrPromise<OutputType | Ctx>, Ctx>[],
    private readonly handleException: ExceptionHandler,
  ) {}

  /**
   * Adds a middleware function to the action pipeline.
   *
   * @template MiddlewareOutput - The return type of the middleware function. Can be a value, Promise, or context object via `next()`.
   * @param fn - The middleware function to add
   * @returns A new ActionBuilder instance with the middleware added
   *
   * @example
   * ```typescript
   * const action = createAction<{ token: string }>()
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
   *   .do(...);
   *
   * const result = await action({ token: 'test' });
   * ```
   */
  with<MiddlewareOutput extends OrPromise<OutputType | Ctx<object>> = never>(
    fn: MiddlewareFn<Input, MiddlewareOutput, Context>,
  ) {
    return new ActionBuilder<
      Input,
      Output | UnwrapNonCtx<MiddlewareOutput>,
      Ctx<Merge<CtxValue<Context>, CtxValue<UnwrapCtx<MiddlewareOutput>>>>,
      IsAsync<Async, MiddlewareOutput>,
      ExceptionHandler
    >([...this.fns, fn], this.handleException);
  }

  /**
   * Adds the final action function and creates an executable action.
   *
   * @template ActionOutput - The return type of the final action function. Can be a value or Promise.
   * @param actionFn - The final action function to execute
   * @returns An executable action that can be called
   *
   * @example
   * ```typescript
   * const action = createAction<{ token: string }>()
   *   .with(getSession)
   *   .with(getUser)
   *   .do(async ({ ctx }) => {
   *     const blogPosts = await getBlogPosts(ctx.user.id);
   *     return blogPosts ?? [];
   *   });
   *
   * const result = await action({ token: 'test' });
   * // BlogPost[]
   * ```
   */
  do<ActionOutput extends OrPromise<OutputType> = never>(actionFn: ActionFn<Input, ActionOutput, Context>) {
    const actionExecutor = createActionExecutor(this.fns, this.handleException, actionFn);

    return actionExecutor as ActionExecutor<
      Input,
      ActionResponse<
        IsAsync<Async, ActionOutput>,
        Output | UnwrapNonCtx<ActionOutput> | InferCatchErr<ExceptionHandler>
      >
    >;
  }
}

type InferCatchErr<F extends (ex: unknown) => unknown> = Awaited<ReturnType<F>>;

type OutputType = string | number | boolean | object | symbol | null | undefined;

type UnwrapNonCtx<T> = Exclude<Awaited<T>, Ctx>;
