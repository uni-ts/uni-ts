import type { Result } from '@uni-ts/result';

declare type Todo = { id: string; userId: string; title: string };

export declare function validateInput(
  data: unknown,
): Result<{ title: string }, 'invalid_data'>;

export declare function getUserSession(): Promise<
  Result<{ id: string; name: string }, 'invalid_token' | 'session_expired'>
>;

export declare function insertTodo(
  data: Pick<Todo, 'userId' | 'title'>,
): Promise<Result<Todo, 'db_connection_error'>>;
