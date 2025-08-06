import { ActionBuilder } from './action-builder.js';

export function createAction<
  Input,
  ExceptionHandler extends (ex: unknown) => unknown = typeof defaultActionExceptionHandler,
>({ onThrow }: { onThrow?: ExceptionHandler } = {}) {
  return new ActionBuilder<Input, ExceptionHandler>([], (onThrow ?? defaultActionExceptionHandler) as ExceptionHandler);
}

export function defaultActionExceptionHandler(ex: unknown): never {
  throw new Error(`[Action] ${ex}`, { cause: ex });
}

export { next } from './helpers.js';
