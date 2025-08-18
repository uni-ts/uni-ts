---
'@uni-ts/model': minor
---

Change the way models are extended.

In previous versions, it was possible to extend models using the `.extend()` method.

From now on, you can use the second argument of the `createModel` function to add custom functionality when defining a model and the new `derive` function if you want to use an existing model extensions when creating a new one.

```typescript
type Person = InferModelOutput<typeof Person>;
const Person = createModel(z.object({ name: z.string() }), {
  greet: (p: Person) => `Hello, ${p.name}!`,
});

type Employee = InferModelOutput<typeof Employee>;
const Employee = createModel(
  Person.schema.extend({
    id: z.string(),
  }),
  {
    ...derive(Person),
    getBadge: (emp: Employee) => `EMP-${emp.id}`,
  }
);

const emp = Employee.from({ name: 'John', id: '123' });
Employee.greet(emp); // "Hello, John!"
Employee.getBadge(emp); // "EMP-123"
```
