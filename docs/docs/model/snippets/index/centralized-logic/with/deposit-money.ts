import { Account } from './account';

export function depositMoney(account: Account, amount: number) {
  if (!Account.canReceiveMoney(account)) {
    throw new Error('Cannot make a deposit');
  }

  // ...
}
