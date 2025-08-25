# @uni-ts/result

## 0.1.0

### Minor Changes

- 38ef035: Update package.json exports to use "default" field instead of the "import" one

## 0.0.4

### Patch Changes

- ca6f865: Enable mixed result types handling in `isOk` and `isErr` functions

## 0.0.3

### Patch Changes

- e813fc8: Update package's README.md with link to the documentation

## 0.0.2

### Patch Changes

- e9f2a1d: Make `Ok` and `Err` interface properties readonly.
- 217391d: Add `tap` function that allows to do something with the result (side-effect) while preserving it unchanged for the further operations.

  ```typescript
  const result = pipe(
    ok("hello"),
    tap((result) => {
      console.log("Result:", result); // Logs the result (side-effect)
      return "something"; // Return value is ignored
    }),
    mapOk((data) => data.toUpperCase()) // Original result is passed through
  ); // { success: true, data: "HELLO" }
  ```

- d3006aa: Add `toTuple` function that returns a tuple of the data and error from a result.

  ```typescript
  function divide(a: number, b: number) {
    return b === 0 ? err("division_by_zero") : ok(a / b);
  }

  const [data, error] = toTuple(divide(10, 2));

  if (!error) {
    console.log(`Division result is: ${data}`);
  }
  ```

## 0.0.1

### Patch Changes

- 3a2c8a1: Initial release
