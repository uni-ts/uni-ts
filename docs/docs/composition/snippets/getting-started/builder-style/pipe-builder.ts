import { pipe } from '@uni-ts/composition/builder';

const greeting = pipe({ name: '  Alice  ', email: 'alice@example.com' })
  .andThen((user) => user.name) // Extract name
  .andThen((name) => name.trim()) // Remove whitespace
  .andThen((name) => `Hello, ${name}!`) // Add greeting
  .run(); // Call .run() to execute immediately // "Hello, Alice!"
