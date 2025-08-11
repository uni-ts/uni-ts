import type { Account } from './account';

export function transferMoney(from: Account, to: Account, amount: number) {
  if (!from.isActive || from.balance < amount || !to.isActive) {
    throw new Error('Cannot make a transfer');
  }

  // ...
}
