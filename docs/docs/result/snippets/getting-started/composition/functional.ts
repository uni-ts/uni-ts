// biome-ignore assist/source/organizeImports: fine here
import type { UnwrapErr, UnwrapOk } from '@uni-ts/result';
import { getUserSession, insertTodo, validateInput } from './declarations';
// ---cut---
import { flow } from '@uni-ts/composition';
import { mapOk } from '@uni-ts/result/fp';

const createTodo = flow(
  validateInput,
  mapOk((input) =>
    flow(
      getUserSession,
      mapOk((session) => insertTodo({ userId: session.id, ...input })),
      mapOk((todo) => ({ id: todo.id })),
    ),
  ),
);

const todo = await createTodo({ title: 'Buy groceries' });

type Success = UnwrapOk<typeof todo>; // result Ok type
type Error = UnwrapErr<typeof todo>; // result Err type
