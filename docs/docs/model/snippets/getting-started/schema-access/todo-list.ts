import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';
import { Todo } from './todo';

export type TodoList = InferModelOutput<typeof TodoList>;
export const TodoList = createModel(
  z.object({
    id: z.int().positive(),
    name: z.string().min(1),
    todos: z.array(Todo.schema), // ✅ Use the underlying schema
  }),
);
