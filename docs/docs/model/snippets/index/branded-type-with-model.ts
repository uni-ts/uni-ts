import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

// Create model with a branded type using .brand()
const Email = createModel(z.string().email().brand('Email'));

// Get the branded type (hover to see it's not just a string)
type Email = InferModelOutput<typeof Email>;

// Our function accepts only valid emails
function sendWelcomeEmail(to: Email) {}

// We get the email from an external source
const email = String(window.prompt('Enter your email'));

sendWelcomeEmail(email); // Not validated email

if (Email.is(email)) {
  sendWelcomeEmail(email); // Validated email
}

sendWelcomeEmail(Email.from(email)); // Another validated email
