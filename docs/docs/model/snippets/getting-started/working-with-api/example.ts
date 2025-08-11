import { User } from './user';
import { fetchUser } from './user-service';

const user = await fetchUser('123e4567-e89b-12d3-a456-426614174000');

if (User.isNew(user)) {
  console.log(`Welcome ${user.name}!`);
}
