import { createModel, type InferModelOutput } from '@uni-ts/model';
import { type } from 'arktype';

export type Email = InferModelOutput<typeof Email>;
export const Email = createModel(type('string.email#Email'));

export type UserId = InferModelOutput<typeof UserId>;
export const UserId = createModel(type('string.uuid#UserId'));
