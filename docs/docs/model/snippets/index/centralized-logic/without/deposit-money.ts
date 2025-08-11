import type { Account } from './account';

export function depositMoney(account: Account, amount: number) {
  if (!account.isActive) {
    throw new Error('Cannot make a deposit');
  }

  // ...
}
