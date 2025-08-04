import type { Err, Result, UnknownResult, UnwrapErr, UnwrapOk } from '@uni-ts/result';
import { isResult } from '@uni-ts/result';

// biome-ignore lint/complexity/noBannedTypes: fine as the default value.
export function next<const Value extends object = {}>(value = {} as Value): Ctx<Value> {
  return { type: 'ctx', value };
}

export class ActionBuilder<
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
    return new ActionBuilder<
      Input,
      ExceptionHandler,
      CurrentOk | UnwrapOk<MiddlewareOutput>,
      CurrentErr | UnwrapErr<MiddlewareOutput>,
      Ctx<Merge<CtxValue<Context>, CtxValue<UnwrapCtx<MiddlewareOutput>>>>,
      IsAsync<Async, MiddlewareOutput>
    >([...this.fns, fn], this.handleException);
  }

  do<ActionOutput extends OrPromise<UnknownResult> = never>(actionFn: ActionFn<Input, ActionOutput, Context>) {
    const processMiddleware = (
      input: Input,
      ctx: Ctx<CtxValue<Context>>,
    ): OrPromise<UnknownResult | Ctx<CtxValue<Context>>> => {
      const extendCtx = (newCtx: Ctx) => {
        ctx.value = { ...ctx.value, ...newCtx.value };
      };

      for (const middlewareFn of this.fns) {
        let resultOrContext = middlewareFn({ input, ctx: ctx.value });

        if (resultOrContext instanceof Promise) {
          return resultOrContext.then(async (r) => {
            resultOrContext = r;

            if (isResult(resultOrContext)) return resultOrContext;
            extendCtx(resultOrContext);

            for (const asyncMiddlewareFn of this.fns.slice(this.fns.indexOf(middlewareFn) + 1)) {
              resultOrContext = await asyncMiddlewareFn({ input, ctx: ctx.value });

              if (isResult(resultOrContext)) return resultOrContext;
              extendCtx(resultOrContext);
            }

            return ctx;
          });
        }

        if (isResult(resultOrContext)) return resultOrContext;
        extendCtx(resultOrContext);
      }

      return ctx;
    };

    const processAction = (input: Input, ctx: CtxValue<Context>): unknown => {
      const actionResult = actionFn({ input, ctx });
      return actionResult instanceof Promise ? actionResult.catch(this.handleException) : actionResult;
    };

    const actionExecutor = (input: Input): unknown => {
      try {
        const resultOrContext = processMiddleware(input, next());

        if (resultOrContext instanceof Promise) {
          return resultOrContext
            .then((r) => (isResult(r) ? r : processAction(input, r.value)))
            .catch(this.handleException);
        }

        if (isResult(resultOrContext)) return resultOrContext;

        return processAction(input, resultOrContext.value);
      } catch (ex) {
        return this.handleException(ex);
      }
    };

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

type ActionExecutor<Input, Response> = Input extends object ? (input: Input) => Response : () => Response;

type ActionResponse<Async extends boolean, Content> = Async extends true ? Promise<Content> : Content;

type InferCatchErr<F> = F extends (ex: unknown) => Err<infer E> ? E : never;

// biome-ignore lint/complexity/noBannedTypes: fine as the default value.
type Ctx<Value extends object = {}> = {
  type: 'ctx';
  value: Value;
};

type CtxValue<T> = T extends Ctx<infer Value> ? Value : never;

type UnwrapCtx<T> = Extract<Awaited<T>, Ctx>;

type MiddlewareFn<Input, Output, Context extends Ctx> = (opts: { input: Input; ctx: CtxValue<Context> }) => Output;

type ActionFn<Input, Output, Context> = (opts: { input: Input; ctx: CtxValue<Context> }) => Output;

type IsAsync<Current extends boolean, Return> = [Return] extends [never]
  ? false
  : Current extends true
    ? true
    : Return extends Promise<unknown>
      ? true
      : false;

type OrPromise<T> = T | Promise<T>;

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

type Merge<Destination, Source> = Simplify<
  {
    [Key in keyof Destination as Key extends keyof Source ? never : Key]: Destination[Key];
  } & Source
>;
