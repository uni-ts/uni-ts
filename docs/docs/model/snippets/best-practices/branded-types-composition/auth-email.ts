import { createModel, type InferModelOutput } from '@uni-ts/model';
import { Email } from './email';

export type AuthEmail = InferModelOutput<typeof AuthEmail>;
export const AuthEmail = createModel(Email.schema.brand('AuthEmail'));
