declare function getCurrentUser(): Promise<{ id: string; name: string } | null>;
declare function createPostInDB(data: object): Promise<{ id: string }>;
declare function updatePostInDB(data: object): Promise<{ id: string }>;

// ---cut---
import { createAction, next } from '@uni-ts/action';

type BlogPost = { id: string; title: string; content: string };

// Actions compose these reusable pieces
const createPost = createAction<Omit<BlogPost, 'id'>>()
  .with(validateData)
  .with(authenticate)
  .with(({ ctx }) => log(`User ${ctx.user.id} creating post`))
  .do(async ({ input, ctx: { user } }) => {
    const post = await createPostInDB({ ...input, userId: user.id });
    return post;
  });

const updatePost = createAction<BlogPost>()
  .with(validateData)
  .with(authenticate)
  .with(({ input, ctx: { user } }) =>
    log(`User ${user.id} updating post ${input.id}`),
  )
  .do(async ({ input, ctx: { user } }) => {
    const post = await updatePostInDB({ ...input, userId: user.id });
    return post;
  });

function validateData({ input }: { input: Omit<BlogPost, 'id'> }) {
  if (input.title.length < 3 || input.content.length < 10) {
    throw new Error('Invalid data');
  }
  return next();
}

async function authenticate() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return next({ user });
}

function log(data: string) {
  console.log(data);
  return next();
}
