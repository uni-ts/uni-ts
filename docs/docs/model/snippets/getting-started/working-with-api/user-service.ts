import { ApiUser } from './api-user';

export async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const apiData = await response.json();

  // Validate API response
  const apiUser = ApiUser.cast(apiData);

  // Convert to domain model
  return ApiUser.toUser(apiUser);
}
