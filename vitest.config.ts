import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/*'],
    include: ['**/src/**/*.spec.ts'],
    coverage: {
      include: ['**/src/**/*.ts'],
    },
  },
});
