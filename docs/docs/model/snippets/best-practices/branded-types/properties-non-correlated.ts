export type UserId = InferModelOutput<typeof UserId>;
export const UserId = createModel(z.uuid().brand('UserId'));
export type PostId = InferModelOutput<typeof PostId>;
export const PostId = createModel(z.uuid().brand('PostId'));

// ---cut---
import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export const CommentId = createModel(z.uuid().brand('CommentId'));
export type CommentId = InferModelOutput<typeof CommentId>;

// Each property is validated independently
export type Comment = InferModelOutput<typeof Comment>;
export const Comment = createModel(
  z.object({
    id: CommentId.schema,
    authorId: UserId.schema,
    postId: PostId.schema,
    content: z.string().min(1),
  }),
);
