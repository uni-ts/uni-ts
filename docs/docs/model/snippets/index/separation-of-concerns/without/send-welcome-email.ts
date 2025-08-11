import { isEmail } from './is-email';

// Function is responsible for both
// email validation and sending the email
export function sendWelcomeEmail(to: string) {
  if (!isEmail(to)) {
    throw new Error('Invalid email');
  }
  // ...
}
