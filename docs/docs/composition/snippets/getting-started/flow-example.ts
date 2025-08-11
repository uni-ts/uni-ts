import { flow } from '@uni-ts/composition';

const greetUser = flow(
  (user: { name: string; email: string }) => user.name, // Extract name
  (name) => name.trim(), // Remove whitespace from sides
  (name) => `Hello, ${name}!`, // Add greeting
);

const user = { name: '  Alice  ', email: 'alice@example.com' };
const greeting = greetUser(user); // "Hello, Alice!"
