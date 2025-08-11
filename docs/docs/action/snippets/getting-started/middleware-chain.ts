import { createAction, next } from '@uni-ts/action';

const action = createAction<{ token: string; amount: number }>()
  .with(({ input }) => {
    // Middleware can throw to stop the pipeline
    if (!input.token) {
      throw new Error('Token is required');
    }
    return next(); // Continue without adding context
  })
  .with(({ input }) => {
    // Middleware can return early to short-circuit
    if (input.amount === 0) {
      return { success: false, reason: 'Zero amount' };
    }
    return next({ validAmount: input.amount }); // Continue with context
  })
  .with(({ ctx }) => {
    // Middleware can access previous context
    const fee = ctx.validAmount * 0.1;
    return next({ fee });
  });
