// @errors: 2345

import { AuthEmail } from './auth-email';
import { Email } from './email';

declare function signIn(email: AuthEmail): void;
declare function sendEmail(email: Email): void;
declare function track(message: string): void;

// Hover to see the types
const email = Email.from('test@test.com');
const authEmail = AuthEmail.from('test@test.com');

// Both can be tracked as they are strings
track(authEmail);
track(email);

// Both can be sent as they are emails
sendEmail(authEmail);
sendEmail(email);

// Only AuthEmail can be used to sign in
signIn(authEmail);
signIn(email);
