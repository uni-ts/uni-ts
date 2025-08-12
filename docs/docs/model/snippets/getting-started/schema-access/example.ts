import { TodoList } from './todo-list';

const todoList = TodoList.from({
  id: 1,
  name: 'My Tasks',
  todos: [
    { id: 1, title: 'Learn TypeScript', completed: true },
    { id: 2, title: 'Build an app', completed: false },
  ],
});
