import { createModel } from '@uni-ts/model';
import { z } from 'zod';

// Create the first model
const Todo = createModel(
  z.object({
    id: z.int().positive(),
    title: z.string().min(1),
    completed: z.boolean().default(false),
  }),
);

// Compose schemas using the .schema property
const TodoList = createModel(
  z.object({
    id: z.int().positive(),
    name: z.string().min(1),
    todos: z.array(Todo.schema), // ✅ Use the underlying schema
  }),
);

// Create nested validation
const todoList = TodoList.from({
  id: 1,
  name: 'My Tasks',
  todos: [
    { id: 1, title: 'Learn TypeScript', completed: true },
    { id: 2, title: 'Build an app', completed: false },
  ],
});
