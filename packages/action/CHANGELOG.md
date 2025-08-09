# @uni-ts/action

## 0.1.2

### Patch Changes

- 9671314: If you're using the `/safe` imports from `@uni-ts/result`, update its version to 0.0.2 or above.
- Updated dependencies [e9f2a1d]
- Updated dependencies [217391d]
- Updated dependencies [d3006aa]
  - @uni-ts/result@0.0.2

## 0.1.1

### Patch Changes

- ad6f16c: Actions by default uses ThrownActionError for errors thrown within the pipeline
- 98eaccc: Export safe action utils from package.json
- 1457e18: Add JSDoc comments to all exported utils and types

## 0.1.0

### Minor Changes

- e30a457: `createAction` is now unsafe by default (throws exceptions instead of returning `Result`). In order to use the previous behavior, you need to import `createSafeAction` from `@uni-ts/action/safe`.

  ```typescript
  // Before
  import { createAction } from "@uni-ts/action";

  // After
  import { createSafeAction } from "@uni-ts/action/safe";
  ```

## 0.0.2

### Patch Changes

- 4323de9: Fix missing dist folder generation

## 0.0.1

### Patch Changes

- 3a2c8a1: Initial release
- Updated dependencies [3a2c8a1]
  - @uni-ts/result@0.0.1
