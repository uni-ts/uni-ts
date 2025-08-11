declare function getSession(): Promise<{ id: string; name: string }>;
declare function chargeCard(
  userId: string,
  amount: number,
): Promise<{ transactionId: string }>;

// ---cut---
import { createAction, next } from '@uni-ts/action';

type Input = { amount: number };

const processPayment = createAction<Input>()
  .with(validateInput)
  .with(authenticate)
  .do(async ({ input, ctx }) => chargeCard(ctx.user.id, input.amount));

function validateInput({ input }: { input: Input }) {
  if (input.amount <= 0) throw new Error('invalid_amount');
  return next();
}

async function authenticate({ input }: { input: Input }) {
  const user = await getSession();
  return next({ user });
}
