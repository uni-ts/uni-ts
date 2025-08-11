import { pipe } from '@uni-ts/composition';

const greeting = pipe(
  { name: '  Alice  ', email: 'alice@example.com' },
  (user) => user.name, // Extract name
  (name) => name.trim(), // Remove whitespace
  (name) => `Hello, ${name}!`, // Add greeting
); // "Hello, Alice!"
