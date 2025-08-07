export class ThrownActionError extends Error {
  readonly type = 'ThrownActionError';

  readonly originalEx?: unknown;

  constructor(ex: unknown) {
    if (ex instanceof Error) {
      super(ex.message, { cause: ex.cause });
      this.originalEx = ex;
    } else {
      super(String(ex));
    }

    this.name = ThrownActionError.name;
  }
}
