type UserInput = { name: string; email: string };
type DbUser = { id: string; name: string; email: string };
declare function validateUserData(data: unknown): UserInput;
declare function createUserInDB(user: UserInput): Promise<DbUser>;
declare function sendWelcomeEmail(email: string): Promise<void>;

// ---cut---
import { createAction, next } from '@uni-ts/action';

const register = createAction<unknown>()
  .with(({ input }) => {
    try {
      return next({ userInput: validateUserData(input) });
    } catch (error) {
      throw new Error(`Validation error: ${error}`);
    }
  })
  .with(async ({ ctx }) => {
    try {
      return next({ user: await createUserInDB(ctx.userInput) });
    } catch (error) {
      throw new Error(`Database error: ${error}`);
    }
  })
  .with(async ({ ctx }) => {
    try {
      await sendWelcomeEmail(ctx.user.email);
      return next({ emailSent: true });
    } catch (error) {
      console.warn('Failed to send welcome email:', error);
      return next({ emailSent: false });
    }
  })
  .do(({ ctx }) => {
    return { user: ctx.user, emailSent: ctx.emailSent };
  });
