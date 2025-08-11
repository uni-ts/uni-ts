function divide(a: number, b: number) {
  if (b === 0) {
    // Hidden error - not visible in type signature
    throw new Error('division_by_zero');
  }
  return a / b;
}

// TypeScript says this returns `number`, but it can actually throw
const result = divide(10, 0); // 💥 Runtime exception
//    ^?
