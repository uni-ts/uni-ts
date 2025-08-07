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

export { next } from './helpers.js';

export class ActionBuilder<
  Input,
  CurrentOutput,
  Context extends Ctx,
  Async extends boolean,
  ExceptionHandler extends (ex: unknown) => unknown,
> {
  constructor(
    private readonly fns: MiddlewareFn<Input, OrPromise<OutputType | Ctx>, Ctx>[],
    private readonly handleException: ExceptionHandler,
  ) {}

  with<MiddlewareOutput extends OrPromise<OutputType | Ctx<object>> = never>(
    fn: MiddlewareFn<Input, MiddlewareOutput, Context>,
  ) {
    return new ActionBuilder<
      Input,
      CurrentOutput | UnwrapNonCtx<MiddlewareOutput>,
      Ctx<Merge<CtxValue<Context>, CtxValue<UnwrapCtx<MiddlewareOutput>>>>,
      IsAsync<Async, MiddlewareOutput>,
      ExceptionHandler
    >([...this.fns, fn], this.handleException);
  }

  do<ActionOutput extends OrPromise<OutputType> = never>(actionFn: ActionFn<Input, ActionOutput, Context>) {
    const actionExecutor = createActionExecutor(this.fns, this.handleException, actionFn);

    return actionExecutor as ActionExecutor<
      Input,
      ActionResponse<
        IsAsync<Async, ActionOutput>,
        CurrentOutput | UnwrapNonCtx<ActionOutput> | InferCatchErr<ExceptionHandler>
      >
    >;
  }
}

type InferCatchErr<F extends (ex: unknown) => unknown> = Awaited<ReturnType<F>>;

type OutputType = string | number | boolean | object | symbol | null | undefined;

type UnwrapNonCtx<T> = Exclude<Awaited<T>, Ctx>;
