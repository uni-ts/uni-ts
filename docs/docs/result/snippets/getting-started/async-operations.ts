import { fromThrowable, match, tryCatch, unwrapOrNull } from '@uni-ts/result';

async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();
  return user as { id: string; name: string };
}

const safeFetchUser = fromThrowable(fetchUser, 'failed_to_fetch_user');

const user = safeFetchUser('1');
const userOrNull = unwrapOrNull(safeFetchUser('1'));
const userName = match(
  tryCatch(fetchUser('1'), 'failed_to_fetch_user'),
  (user) => user.name,
  () => 'unknown',
);
