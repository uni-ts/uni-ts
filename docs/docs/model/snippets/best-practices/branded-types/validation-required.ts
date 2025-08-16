import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type Email = InferModelOutput<typeof Email>;
export const Email = createModel(z.email().brand('Email'));

// Those usages will break if email is not validated
declare function sendWelcomeEmail(to: Email): void;
declare function joinNewsletter(to: Email): void;
declare function createAccount(email: Email): void;
declare function validateDomain(to: Email, domain: string): boolean;
