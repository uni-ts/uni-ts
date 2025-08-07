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

export { next } from './helpers.js';

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
