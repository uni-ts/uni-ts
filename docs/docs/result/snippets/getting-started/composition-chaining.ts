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

import type { UnwrapErr, UnwrapOk } from '@uni-ts/result';
// ---cut---
import { result } from '@uni-ts/result/builder';

const createTodo = result(validateInput)
  .mapOk((input) =>
    result(getUserSession)
      .mapOk((session) => insertTodo({ userId: session.id, ...input }))
      .mapOk((todo) => ({ id: todo.id }))
      .create(),
  )
  .create();

const todo = await createTodo({ title: 'Buy groceries' });

type Success = UnwrapOk<typeof todo>; // result Ok type
type Error = UnwrapErr<typeof todo>; // result Err type
