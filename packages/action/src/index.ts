import { ActionBuilder } from './action-builder.js';
import { ThrownActionError } from './error.js';
import type { Ctx } from './helpers.js';

export function createAction<
  Input = never,
  ExceptionHandler extends (ex: unknown) => unknown = typeof defaultActionExceptionHandler,
>({ onThrow }: { onThrow?: ExceptionHandler } = {}) {
  return new ActionBuilder<Input, never, Ctx, false, ExceptionHandler>(
    [],
    (onThrow ?? defaultActionExceptionHandler) as ExceptionHandler,
  );
}

export function defaultActionExceptionHandler(ex: unknown): never {
  throw new ThrownActionError(ex);
}

export { next } from './helpers.js';
export { ThrownActionError };
