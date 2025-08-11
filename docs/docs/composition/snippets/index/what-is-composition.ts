import { flow } from '@uni-ts/composition';

const trim = (str: string) => str.trim();
const toLowerCase = (str: string) => str.toLowerCase();
const upperFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const addGreeting = (name: string) => `Hello, ${name}!`;

// Compose simple functions into a complex operation
const greet = flow(trim, toLowerCase, upperFirst, addGreeting);
console.log(greet('  ALICE  ')); // "Hello, Alice!"
