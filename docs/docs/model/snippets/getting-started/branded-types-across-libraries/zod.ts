import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type Email = InferModelOutput<typeof Email>;
export const Email = createModel(z.email().brand('Email'));

export type UserId = InferModelOutput<typeof UserId>;
export const UserId = createModel(z.uuid().brand('UserId'));
