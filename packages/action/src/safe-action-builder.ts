import type { Err, Result, UnknownResult, UnwrapErr, UnwrapOk } from '@uni-ts/result';
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

export class SafeActionBuilder<
  Input,
  ExceptionHandler extends (ex: unknown) => Err<unknown>,
  CurrentOk = never,
  CurrentErr = never,
  Context extends Ctx = Ctx,
  Async extends boolean = false,
> {
  constructor(
    private readonly fns: MiddlewareFn<Input, OrPromise<UnknownResult | Ctx>, Ctx>[],
    private readonly handleException: ExceptionHandler,
  ) {}

  with<MiddlewareOutput extends OrPromise<UnknownResult | Ctx<object>> = never>(
    fn: MiddlewareFn<Input, MiddlewareOutput, Context>,
  ) {
    return new SafeActionBuilder<
      Input,
      ExceptionHandler,
      CurrentOk | UnwrapOk<MiddlewareOutput>,
      CurrentErr | UnwrapErr<MiddlewareOutput>,
      Ctx<Merge<CtxValue<Context>, CtxValue<UnwrapCtx<MiddlewareOutput>>>>,
      IsAsync<Async, MiddlewareOutput>
    >([...this.fns, fn], this.handleException);
  }

  do<ActionOutput extends OrPromise<UnknownResult> = never>(actionFn: ActionFn<Input, ActionOutput, Context>) {
    const actionExecutor = createActionExecutor(this.fns, this.handleException, actionFn);

    return actionExecutor as ActionExecutor<
      Input,
      ActionResponse<
        IsAsync<Async, ActionOutput>,
        Result<
          CurrentOk | UnwrapOk<ActionOutput>,
          CurrentErr | UnwrapErr<ActionOutput> | InferCatchErr<ExceptionHandler>
        >
      >
    >;
  }
}

type InferCatchErr<F> = F extends (ex: unknown) => Err<infer E> ? E : never;
