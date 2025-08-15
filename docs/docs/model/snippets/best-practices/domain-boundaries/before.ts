import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

// This model combines multiple unrelated business concepts:
// profile display, preferences, and subscription.
export type User = InferModelOutput<typeof User>;
export const User = createModel(
  z.object({
    id: z.uuid().brand('UserId'),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    theme: z.enum(['light', 'dark']),
    language: z.enum(['en', 'es', 'fr']),
    subscriptionExpiresAt: z.date().optional(),
    billingAddress: z.string().optional(),
  }),
).extend({
  getDisplayName,
  updateTheme,
  updateLanguage,
  isSubscribed,
});

function getDisplayName(user: User) {
  return `${user.firstName} ${user.lastName}`;
}

function updateTheme(user: User, theme: User['theme']) {
  return { ...user, theme };
}

function updateLanguage(user: User, language: User['language']) {
  return { ...user, language };
}

function isSubscribed(user: User) {
  return !!user.subscriptionExpiresAt;
}
