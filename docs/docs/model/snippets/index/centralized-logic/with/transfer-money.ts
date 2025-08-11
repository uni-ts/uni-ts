import { Account } from './account';

export function transferMoney(from: Account, to: Account, amount: number) {
  if (!Account.canTransferMoney(from, to, amount)) {
    throw new Error('Cannot make a transfer');
  }

  // ...
}
