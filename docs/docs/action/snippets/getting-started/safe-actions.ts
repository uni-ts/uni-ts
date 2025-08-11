import { createSafeAction, next } from '@uni-ts/action/safe';
import { err, isOk, ok } from '@uni-ts/result';

const safeAction = createSafeAction<{ value: number }>()
  .with(({ input }) => {
    if (input.value < 0) {
      // Return error instead of throwing
      return err('negative_value');
    }
    // next() function works as usual
    return next();
  })
  .with(({ input }) => next({ doubled: input.value * 2 }))
  .do(({ ctx }) => {
    // Return ok() instead of a raw value
    return ok(ctx.doubled);
  });

// Returns the Result type
const result = safeAction({ value: 10 });

if (isOk(result)) {
  console.log('Success:', result.data); // 20
} else {
  console.log('Error:', result.error); // 'negative_value'
}
