import type { Account } from './account';

export function withdrawMoney(account: Account, amount: number) {
  if (!account.isActive || account.balance < amount) {
    throw new Error('Cannot make a withdrawal');
  }

  // ...
}
