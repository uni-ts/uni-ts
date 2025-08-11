function divide(a: number, b: number) {
  if (b === 0) {
    throw new Error('division_by_zero');
  }
  return a / b;
}

// ---cut---
function calculate() {
  try {
    const x = divide(10, 2);
    const y = divide(8, 0);

    // ... maybe some more functions

    return x + y;
  } catch (ex) {
    // What exception? From which function?
    // We need to inspect implementation or use instanceof checks
    // to ensure we handle only the `divide` function exceptions
    if (ex instanceof Error && ex.message === 'division_by_zero') {
      return 0;
    }

    // Re-throw in case of exceptions from other functions
    // (current ones or introduced in the future)
    throw ex;
  }
}
