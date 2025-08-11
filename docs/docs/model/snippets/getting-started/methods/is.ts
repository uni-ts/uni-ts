import { User } from './user';

export function processUserData(data: unknown) {
  if (User.is(data)) {
    // TypeScript knows data is User type
    console.log(`Processing user: ${data.name}`);
    return data;
  }

  throw new Error('Invalid user data');
}
