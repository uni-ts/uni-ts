import { expect, it } from 'vitest';
import { add } from './index.js';

it('adds two numbers', () => {
  expect(add(1, 2)).toBe(3);
});
