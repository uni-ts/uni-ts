import type { Err, UnknownResult } from '@uni-ts/result';
import { err } from '@uni-ts/result';
import { ThrownActionError } from './error.js';
import type { Ctx } from './helpers.js';
import { SafeActionBuilder } from './safe-action-builder.js';

export function createSafeAction<
  Input = never,
  ExceptionHandler extends (ex: unknown) => UnknownResult = typeof defaultActionExceptionHandler,
>({ onThrow }: { onThrow?: ExceptionHandler } = {}) {
  return new SafeActionBuilder<Input, never, never, Ctx, false, ExceptionHandler>(
    [],
    (onThrow ?? defaultActionExceptionHandler) as ExceptionHandler,
  );
}

export function defaultActionExceptionHandler(ex: unknown): Err<ThrownActionError> {
  return err(new ThrownActionError(ex));
}

export { next } from './helpers.js';
export { ThrownActionError };
