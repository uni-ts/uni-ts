import { User } from './user';

const user = User.from({
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
});

console.log(user.name); // "John Doe"
