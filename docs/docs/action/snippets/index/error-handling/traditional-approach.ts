type UserInput = { name: string; email: string };
type DbUser = { id: string; name: string; email: string };
declare function validateInput(data: unknown): UserInput;
declare function createUserInDB(user: UserInput): Promise<DbUser>;
declare function sendWelcomeEmail(email: string): Promise<void>;
// ---cut---

async function register(input: unknown) {
  let userInput: UserInput;
  try {
    userInput = validateInput(input);
  } catch (error) {
    throw new Error(`Validation error: ${error}`);
  }

  let user: DbUser;
  try {
    user = await createUserInDB(userInput);
  } catch (error) {
    throw new Error(`Database error: ${error}`);
  }

  let emailSent = false;
  try {
    await sendWelcomeEmail(user.email);
    emailSent = true;
  } catch (error) {
    console.warn('Failed to send welcome email:', error);
  }

  return { user, emailSent };
}
