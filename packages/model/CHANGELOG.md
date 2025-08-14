# @uni-ts/model

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
