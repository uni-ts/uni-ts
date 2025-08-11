import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type Account = InferModelOutput<typeof Account>;
export const Account = createModel(
  z.object({
    id: z.uuid(),
    balance: z.number().min(0),
    isActive: z.boolean(),
  }),
).extend({
  canReceiveMoney,
  canSpendMoney,
  canTransferMoney,
});

function canReceiveMoney(account: Account) {
  return account.isActive;
}

function canSpendMoney(account: Account, amount: number) {
  return account.isActive && account.balance >= amount;
}

function canTransferMoney(from: Account, to: Account, amount: number) {
  return canSpendMoney(from, amount) && canReceiveMoney(to);
}
