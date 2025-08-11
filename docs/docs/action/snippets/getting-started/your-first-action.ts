import { createAction, next } from '@uni-ts/action';

// Create a simple greeting action
const greetUser = createAction<{ name: string; isNew?: boolean }>()
  .with(({ input }) => {
    // Validation middleware
    if (!input.name.trim()) {
      throw new Error('Name cannot be empty');
    }
    return next();
  })
  .with(({ input }) => {
    // Context enrichment middleware
    const greeting = input.isNew ? 'Hello, ' : 'Welcome back,';
    return next({ greeting });
  })
  .do(({ input, ctx }) => {
    // Final action
    return `${ctx.greeting} ${input.name}!`;
  });

// Execute the action
const result = greetUser({ name: 'Alice', isNew: false });
console.log(result); // "Welcome back, Alice!"
