declare function getUser(userId: string): { balance: number };
declare function createTransaction(userId: string, amount: number): string;

// ---cut---
import { err, isErr, ok } from '@uni-ts/result';

function processPayment(userId: string, amount: number) {
  if (userId.length !== 26) {
    return err({ type: 'invalid_user_id' });
  }

  if (amount <= 0) {
    return err({
      type: 'invalid_amount',
      reason: 'negative',
      value: amount,
    });
  }

  const user = getUser(userId);
  if (user.balance < amount) {
    return err({
      type: 'business_error',
      code: 'insufficient_funds',
      userId,
    });
  }

  const transactionId = createTransaction(userId, amount);
  return ok({ transactionId });
}

const result = processPayment('user-123', -10);

if (isErr(result)) {
  const error = result.error;

  if (error.type === 'invalid_user_id') {
    console.log('Invalid user ID');
  }

  if (error.type === 'invalid_amount') {
    console.log(`Invalid amount: ${error.value}. Reason: ${error.reason}`);
  }

  if (error.type === 'business_error') {
    console.log(`Rule violated: ${error.code} for user ${error.userId}`);
  }
}
