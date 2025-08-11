import { Account } from './account';

export function withdrawMoney(account: Account, amount: number) {
  if (!Account.canSpendMoney(account, amount)) {
    throw new Error('Cannot make a withdrawal');
  }

  // ...
}
