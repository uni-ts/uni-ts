// biome-ignore assist/source/organizeImports: fine here
import type { UnwrapErr, UnwrapOk } from '@uni-ts/result';
import { getUserSession, insertTodo, validateInput } from './declarations';
// ---cut---
import { isErr, ok } from '@uni-ts/result';

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
