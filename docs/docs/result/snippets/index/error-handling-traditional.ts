function divide(a: number, b: number) {
  if (b === 0) {
    throw new Error('division_by_zero');
  }
  return a / b;
}

// ---cut---
function calculate() {
  // Easy to forget error handling - code compiles fine
  const x = divide(10, 2);
  const y = divide(8, 0); // 💥 Runtime exception

  return x + y; // This line will never execute
}
