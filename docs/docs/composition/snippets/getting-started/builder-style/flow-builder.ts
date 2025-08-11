import { flow } from '@uni-ts/composition/builder';

const greetUser = flow((user: { name: string; email: string }) => user.name)
  .andThen((name) => name.trim())
  .andThen((name) => `Hello, ${name}!`)
  .create(); // Call .create() at the end to output the function

const user = { name: '  Alice  ', email: 'alice@example.com' };
const greeting = greetUser(user); // "Hello, Alice!"
