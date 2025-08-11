import { User } from './user';

export async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const data: unknown = await response.json();

  // cast() validates unknown data
  return User.cast(data);
}
