import type { Result } from '@uni-ts/result';

type Todo = { id: string; userId: string; title: string };

declare function validateInput(
  data: unknown,
): Result<{ title: string }, 'invalid_data'>;

declare function getUserSession(): Promise<
  Result<{ id: string; name: string }, 'invalid_token' | 'session_expired'>
>;

declare function insertTodo(
  data: Pick<Todo, 'userId' | 'title'>,
): Promise<Result<Todo, 'db_connection_error'>>;

// ---cut---
import { isErr, ok, type UnwrapErr, type UnwrapOk } from '@uni-ts/result';

async function createTodo(data: unknown) {
  const input = validateInput(data);
  if (isErr(input)) return input;

  const session = await getUserSession();
  if (isErr(session)) return session;
  const { id: userId } = session.data;

  const todo = await insertTodo({ userId, ...input.data });
  if (isErr(todo)) return todo;

  return ok({ id: todo.data.id });
}

const todo = await createTodo({ title: 'Buy groceries' });

type Success = UnwrapOk<typeof todo>; // result Ok type
type Error = UnwrapErr<typeof todo>; // result Err type
