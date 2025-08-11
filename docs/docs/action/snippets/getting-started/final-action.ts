import { createAction, next } from '@uni-ts/action';

const processPayment = createAction<{ token: string; amount: number }>()
  .with(({ input }) => {
    if (!input.token) {
      throw new Error('Token required');
    }
    if (input.amount <= 0) {
      return { success: false, error: 'Invalid amount' } as const;
    }
    return next({ validatedAmount: input.amount });
  })
  .do(({ input, ctx }) => {
    // This only runs if middleware passes
    return {
      success: true,
      transactionId: Math.random().toString(36),
      originalAmount: input.amount,
      validatedAmount: ctx.validatedAmount,
    } as const;
  });
