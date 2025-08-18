import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

// Now each business domain has its own model

export type UserProfile = InferModelOutput<typeof UserProfile>;
export const UserProfile = createModel(
  z.object({
    userId: z.uuid().brand('UserId'),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
  }),
  {
    getDisplayName,
  },
);

export type UserPreferences = InferModelOutput<typeof UserPreferences>;
export const UserPreferences = createModel(
  z.object({
    userId: z.uuid().brand('UserId'),
    theme: z.enum(['light', 'dark']),
    language: z.enum(['en', 'es', 'fr']),
  }),
  {
    updateTheme,
    updateLanguage,
  },
);

export type UserSubscription = InferModelOutput<typeof UserSubscription>;
export const UserSubscription = createModel(
  z.object({
    userId: z.uuid().brand('UserId'),
    subscriptionExpiresAt: z.date().optional(),
    billingAddress: z.string().optional(),
  }),
  {
    isSubscribed,
  },
);

function getDisplayName(user: UserProfile) {
  return `${user.firstName} ${user.lastName}`;
}

function updateTheme(user: UserPreferences, theme: UserPreferences['theme']) {
  return { ...user, theme };
}

function updateLanguage(
  user: UserPreferences,
  language: UserPreferences['language'],
) {
  return { ...user, language };
}

function isSubscribed(user: UserSubscription) {
  return !!user.subscriptionExpiresAt;
}
