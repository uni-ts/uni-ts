import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type PostTitle = InferModelOutput<typeof PostTitle>;
export const PostTitle = createModel(z.string().brand('PostTitle'));

export type PostContent = InferModelOutput<typeof PostContent>;
export const PostContent = createModel(z.string().brand('PostContent'));

export type PostSummary = InferModelOutput<typeof PostSummary>;
export const PostSummary = createModel(z.string().brand('PostSummary'));

// All types can be used interchangeably, so branding them
// only adds unnecessary complexity to function signatures
declare function escapeHtml(
  content: PostTitle | PostContent | PostSummary,
): string;
declare function truncate(
  content: PostTitle | PostContent | PostSummary,
  length: number,
): string;
declare function countWords(
  content: PostTitle | PostContent | PostSummary,
): string;
