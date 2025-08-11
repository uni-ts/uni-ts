declare function getCurrentUser(): Promise<{ id: string; name: string } | null>;
declare function createPostInDB(data: object): Promise<{ id: string }>;
declare function updatePostInDB(data: object): Promise<{ id: string }>;
// ---cut---
type BlogPost = { id: string; title: string; content: string };

// Every function handles its own validation, auth, logging
async function createPost(data: Omit<BlogPost, 'id'>) {
  // Validation
  if (data.title.length < 3 || data.content.length < 10) {
    throw new Error('Invalid data');
  }

  // Authentication
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Logging
  console.log(`User ${user.id} creating post`);

  // Finally, the actual business logic
  const post = await createPostInDB({ ...data, userId: user.id });
  return post;
}

async function updatePost(data: BlogPost) {
  // Same validation
  if (data.title.length < 3 || data.content.length < 10) {
    throw new Error('Invalid data');
  }

  // Same authentication
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Same logging
  console.log(`User ${user.id} updating post ${data.id}`);

  // Business logic, that's different
  const post = await updatePostInDB({ ...data, userId: user.id });
  return post;
}
