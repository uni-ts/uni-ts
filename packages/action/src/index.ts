import type { Err } from '@uni-ts/result';
import { err } from '@uni-ts/result';
import { ActionBuilder } from './action-builder.js';

export function createAction<
  Input,
  ExceptionHandler extends (ex: unknown) => Err<unknown> = typeof defaultActionExceptionHandler,
>({ onThrow }: { onThrow?: ExceptionHandler } = {}) {
  return new ActionBuilder<Input, ExceptionHandler>([], (onThrow ?? defaultActionExceptionHandler) as ExceptionHandler);
}

export function defaultActionExceptionHandler(): Err<'UNHANDLED_ERROR'> {
  return err('UNHANDLED_ERROR');
}

export { next } from './action-builder.js';
