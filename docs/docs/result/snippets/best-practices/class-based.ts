declare function getUser(userId: string): { balance: number };
declare function executeTransfer(
  fromId: string,
  toId: string,
  amount: number,
): string;

// ---cut---
import { err, isErr, ok } from '@uni-ts/result';

class ValidationError extends Error {
  readonly type = 'validation_error';

  constructor(
    public field: string,
    public reason: string,
    public value: unknown,
  ) {
    super(`Validation failed for ${field}: ${reason}`);
    this.name = 'ValidationError';
  }
}

class InsufficientFundsError extends Error {
  readonly type = 'insufficient_funds';

  constructor(
    public userId: string,
    public requested: number,
    public available: number,
  ) {
    super(`Insufficient funds: requested ${requested}, available ${available}`);
    this.name = 'InsufficientFundsError';
  }
}

function transferMoney(fromId: string, toId: string, amount: number) {
  if (amount <= 0) {
    return err(new ValidationError('amount', 'must be positive', amount));
  }

  const fromUser = getUser(fromId);
  if (fromUser.balance < amount) {
    return err(new InsufficientFundsError(fromId, amount, fromUser.balance));
  }

  const transferId = executeTransfer(fromId, toId, amount);
  return ok({ transferId });
}

const result = transferMoney('user-1', 'user-2', 1000);

if (isErr(result)) {
  const error = result.error;

  console.log(error.message); // Human-readable message
  console.log(error.stack); // Stack trace for debugging

  if (error instanceof ValidationError) {
    console.log(`Invalid ${error.field}: ${error.value}`);
  }

  if (error instanceof InsufficientFundsError) {
    console.log(
      `User ${error.userId} needs ${error.requested - error.available} more`,
    );
  }
}
