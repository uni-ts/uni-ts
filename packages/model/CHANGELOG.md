# @uni-ts/model

## 0.1.2

### Patch Changes

- 9671314: If you're using the `/safe` imports from `@uni-ts/result`, update its version to 0.0.2 or above.
- Updated dependencies [e9f2a1d]
- Updated dependencies [217391d]
- Updated dependencies [d3006aa]
  - @uni-ts/result@0.0.2

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
