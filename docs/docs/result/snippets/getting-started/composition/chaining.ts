// biome-ignore assist/source/organizeImports: fine here
import type { UnwrapErr, UnwrapOk } from '@uni-ts/result';
import { getUserSession, insertTodo, validateInput } from './declarations';
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
