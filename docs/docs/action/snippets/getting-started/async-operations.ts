declare function processData(data: unknown): string;

// ---cut---
import { createAction, next } from '@uni-ts/action';

const asyncAction = createAction<{ url: string }>()
  .with(async ({ input }) => {
    // Async middleware
    const response = await fetch(input.url);
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    return next({ json: await response.json() });
  })
  .do(({ ctx }) => processData(ctx.json));

// The action returns a Promise
const result = await asyncAction({ url: 'https://api.example.com/data' });
