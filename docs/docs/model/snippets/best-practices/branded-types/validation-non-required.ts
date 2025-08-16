import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type FullName = InferModelOutput<typeof FullName>;
export const FullName = createModel(z.string().brand('FullName'));

// Those functions will work the same way for any string
declare function getInitials(fullName: FullName): string;
declare function createSlug(fullName: FullName): string;
declare function truncate(fullName: FullName): string;
