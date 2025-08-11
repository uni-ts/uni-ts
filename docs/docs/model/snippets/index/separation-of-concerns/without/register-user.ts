import { isEmail } from './is-email';
import { sendWelcomeEmail } from './send-welcome-email';

export function registerUser(data: { email: string; password: string }) {
  if (!isEmail(data.email)) {
    throw new Error('Invalid email');
  }

  // ...

  // Email validation will happen again
  sendWelcomeEmail(data.email);
}
