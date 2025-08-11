import { flow, pipe } from '@uni-ts/composition';

// Define simple, focused functions
const double = (x: number) => x * 2;
const add10 = (x: number) => x + 10;
const stringify = (x: number) => x.toString();

// Method 1: Create a reusable function with flow
const transform = flow(double, add10, stringify);
const result1 = transform(5); // "20"
const result2 = transform(10); // "30"

// Method 2: Transform a value immediately with pipe
const result3 = pipe(5, double, add10, stringify); // "20"
