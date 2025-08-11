import { createModel, type InferModelOutput } from '@uni-ts/model';
import * as v from 'valibot';

export type Email = InferModelOutput<typeof Email>;
export const Email = createModel(
  v.pipe(v.string(), v.email(), v.brand('Email')),
);

export type UserId = InferModelOutput<typeof UserId>;
export const UserId = createModel(
  v.pipe(v.string(), v.uuid(), v.brand('UserId')),
);
