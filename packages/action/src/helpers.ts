// biome-ignore lint/complexity/noBannedTypes: fine as the default value.
export function next<const Value extends object = {}>(value = {} as Value): Ctx<Value> {
  return { type: 'ctx', value };
}

function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

function hasStrictKeys<K extends string>(value: object, keys: K[]): value is { [key in K]: unknown } {
  return Object.keys(value).length === keys.length && keys.every((key) => key in value);
}

export function isCtx(value: unknown): value is Ctx {
  return isObject(value) && hasStrictKeys(value, ['type', 'value']) && value.type === 'ctx';
}

export function createActionExecutor<
  Input,
  MiddlewareOutput,
  ActionOutput,
  Context extends Ctx,
  ExceptionHandler extends (ex: unknown) => unknown,
>(
  fns: MiddlewareFn<Input, OrPromise<MiddlewareOutput | Ctx>, Ctx>[],
  handleException: ExceptionHandler,
  actionFn: ActionFn<Input, ActionOutput, Context>,
): (input: Input) => unknown {
  const processMiddleware = (
    input: Input,
    ctx: Ctx<CtxValue<Context>>,
  ): OrPromise<MiddlewareOutput | Ctx<CtxValue<Context>>> => {
    const extendCtx = (newCtx: Ctx) => {
      ctx.value = { ...ctx.value, ...newCtx.value };
    };

    for (const middlewareFn of fns) {
      let resultOrValue = middlewareFn({ input, ctx: ctx.value });

      if (resultOrValue instanceof Promise) {
        return resultOrValue.then(async (r) => {
          resultOrValue = r;

          if (!isCtx(resultOrValue)) return resultOrValue;
          extendCtx(resultOrValue);

          for (const asyncMiddlewareFn of fns.slice(fns.indexOf(middlewareFn) + 1)) {
            resultOrValue = await asyncMiddlewareFn({ input, ctx: ctx.value });

            if (!isCtx(resultOrValue)) return resultOrValue;
            extendCtx(resultOrValue);
          }

          return ctx;
        });
      }

      if (!isCtx(resultOrValue)) return resultOrValue;
      extendCtx(resultOrValue);
    }

    return ctx;
  };

  const processAction = (input: Input, ctx: CtxValue<Context>): unknown => {
    const actionResult = actionFn({ input, ctx });
    return actionResult instanceof Promise ? actionResult.catch(handleException) : actionResult;
  };

  const actionExecutor = (input: Input): unknown => {
    try {
      const resultOrValue = processMiddleware(input, next());

      if (resultOrValue instanceof Promise) {
        return resultOrValue.then((r) => (isCtx(r) ? processAction(input, r.value) : r)).catch(handleException);
      }

      if (!isCtx(resultOrValue)) return resultOrValue;

      return processAction(input, resultOrValue.value);
    } catch (ex) {
      return handleException(ex);
    }
  };

  return actionExecutor;
}

// Type definitions
// biome-ignore lint/complexity/noBannedTypes: fine as the default value.
export type Ctx<Value extends object = {}> = {
  type: 'ctx';
  value: Value;
};

export type CtxValue<T> = T extends Ctx<infer Value> ? Value : never;

export type UnwrapCtx<T> = Extract<Awaited<T>, Ctx>;

export type MiddlewareFn<Input, Output, Context extends Ctx> = (opts: {
  input: Input;
  ctx: CtxValue<Context>;
}) => Output;

export type ActionFn<Input, Output, Context> = (opts: { input: Input; ctx: CtxValue<Context> }) => Output;

export type ActionExecutor<Input, Response> = Input extends object ? (input: Input) => Response : () => Response;

export type ActionResponse<Async extends boolean, Content> = Async extends true ? Promise<Content> : Content;

export type IsAsync<Current extends boolean, Return> = [Return] extends [never]
  ? false
  : Current extends true
    ? true
    : Return extends Promise<unknown>
      ? true
      : false;

export type OrPromise<T> = T | Promise<T>;

export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

export type Merge<Destination, Source> = Simplify<
  {
    [Key in keyof Destination as Key extends keyof Source ? never : Key]: Destination[Key];
  } & Source
>;
