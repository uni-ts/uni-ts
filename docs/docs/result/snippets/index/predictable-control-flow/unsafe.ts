function divide(a: number, b: number) {
  if (b === 0) {
    throw new Error('division_by_zero');
  }
  return a / b;
}

// ---cut---
function calculate() {
  const x = divide(10, 2); // 5 - works fine
  const y = divide(8, 0); // 💥 Throws exception, disrupts the flow

  return { x, y }; // This line never executes
}
