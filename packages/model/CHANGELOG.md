# @uni-ts/model

## 0.4.1

### Patch Changes

- a07e9c1: Re-export Result type from the safe models file

## 0.4.0

### Minor Changes

- 38ef035: Update package.json exports to use "default" field instead of the "import" one

### Patch Changes

- Updated dependencies [38ef035]
  - @uni-ts/result@0.1.0

## 0.3.1

### Patch Changes

- 1b3846f: - Update the `ModelValidationError` message. Now instead of showing the first issue's message, it shows all issue messages with paths.
  - Provide `prettifyError` function to format the error message.

## 0.3.0

### Minor Changes

- 7166d9d: Change the way models are extended.

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

  const emp = Employee.from({ name: "John", id: "123" });
  Employee.greet(emp); // "Hello, John!"
  Employee.getBadge(emp); // "EMP-123"
  ```

### Patch Changes

- Updated dependencies [ca6f865]
  - @uni-ts/result@0.0.4

## 0.2.2

### Patch Changes

- 8336830: Fix an error when extending safe models removes some of their methods.

## 0.2.1

### Patch Changes

- f95cae3: Export generic types of models. Now you can create your own functions that takes models as parameters using: `Model<S>, SafeModel<S>, SafeFirstModel<S>, UnsafeFirstModel<S>`.

  ```typescript
  import {
    createModel,
    type Model,
    type StandardSchemaV1,
  } from "@uni-ts/model";
  import z, { ZodError } from "zod";

  function getValidatedSearchParams<S extends StandardSchemaV1>(
    model: Model<S>
  ) {
    const searchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(searchParams.entries());

    try {
      return model.cast(params);
    } catch {
      return null;
    }
  }
  ```

## 0.2.0

### Minor Changes

- 1172448: Add `InferModelInput` type. Rename `InferModelType` to `InferModelOutput`

### Patch Changes

- e813fc8: Update package's README.md with link to the documentation

## 0.1.2

### Patch Changes

- 9671314: If you're using the `/safe` imports from `@uni-ts/result`, update its version to 0.0.2 or above.

## 0.1.1

### Patch Changes

- d38b039: Change ModelValidationError name to match its class name

## 0.1.0

### Minor Changes

- 14db656: Safe utilities now return `ModelValidationError` as error value instead of `StandardSchemaV1.FailureResult['issues']`.

  ```typescript
  const Email = createSafeModel(z.string().email().brand("Email"));

  // Before
  const result = Email.from("invalid-email"); // Result<Email, StandardSchemaV1.FailureResult['issues']>

  if (isErr(result)) {
    console.error("Issues are:", result.error.join(","));
  }

  // After
  const result = Email.from("invalid-email"); // Result<Email, ModelValidationError>

  if (isErr(result)) {
    console.error("Issues are:", result.error.issues.join(","));
  }
  ```

### Patch Changes

- 02ec986: Add JSDoc comments to all exported functions and types

## 0.0.2

### Patch Changes

- 4323de9: Fix missing dist folder generation

## 0.0.1

### Patch Changes

- 3a2c8a1: Initial release
