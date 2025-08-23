import { Email } from './email';

declare function sendEmail(email: Email): void;
declare function track(message: string): void;

// Hover to see the type
const email = Email.from('test@test.com');

// Matches the Email branded type
sendEmail(email);

// Matches the string base type
track(email);
