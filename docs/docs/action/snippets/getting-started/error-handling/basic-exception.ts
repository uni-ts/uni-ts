import { createAction, next, ThrownActionError } from '@uni-ts/action';

const action = createAction<{ value: number }>()
  .with(({ input }) => {
    if (input.value < 0) {
      throw new Error('Negative values not allowed');
    }
    return next();
  })
  .do(({ input }) => input.value * 2);

try {
  const result = action({ value: -5 });
} catch (error) {
  if (error instanceof ThrownActionError) {
    console.log('Action failed:', error.message); // "Negative values not allowed"
    console.log('Original error:', error.cause);
  }
}
