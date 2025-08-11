import { createAction } from '@uni-ts/action';

const actionWithCustomError = createAction({
  onThrow: (error) => {
    console.error('Action failed:', error);
    // Return instead of throwing
    return { success: false, error: String(error) };
  },
})
  .with(() => {
    throw new Error('Something went wrong');
  })
  .do(() => ({ success: true, data: 'result' }));

const result = actionWithCustomError();
// Returns: { success: false, error: "Error: Something went wrong" }
