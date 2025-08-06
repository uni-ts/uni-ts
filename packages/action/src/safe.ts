import type { Err } from '@uni-ts/result';
import { err } from '@uni-ts/result';
import { SafeActionBuilder } from './safe-action-builder.js';

export function createSafeAction<
  Input,
  ExceptionHandler extends (ex: unknown) => Err<unknown> = typeof defaultActionExceptionHandler,
>({ onThrow }: { onThrow?: ExceptionHandler } = {}) {
  return new SafeActionBuilder<Input, ExceptionHandler>(
    [],
    (onThrow ?? defaultActionExceptionHandler) as ExceptionHandler,
  );
}

export function defaultActionExceptionHandler(): Err<'UNHANDLED_ERROR'> {
  return err('UNHANDLED_ERROR');
}

export { next } from './helpers.js';
