import { Email } from './email';
import { sendWelcomeEmail } from './send-welcome-email';

export function registerUser(data: { email: string; password: string }) {
  const email = Email.from(data.email);

  // ...

  // We know email is already validated from its type
  sendWelcomeEmail(email);
}
