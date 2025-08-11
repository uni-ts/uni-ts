import { createAction, next } from '@uni-ts/action';

// Each middleware is easily testable in isolation
const validateInput = ({ input }: { input: { age: number } }) => {
  if (input.age < 0) throw new Error('Invalid age');
  return next();
};

// Test the validation middleware independently
// validateInput({ input: { age: -1 } }); // throws Error
// validateInput({ input: { age: 25 } }); // returns next()

// Actions can be tested with different middleware combinations
const isAdultAction = createAction<{ age: number }>()
  .with(validateInput)
  .do(({ input }) => input.age >= 18);

// Easy to test the complete pipeline
// isAdultAction({ age: 25 }); // true
// isAdultAction({ age: -1 }); // throws Error
