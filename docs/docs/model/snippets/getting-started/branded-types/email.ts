import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

// Create branded type
type Email = InferModelOutput<typeof Email>;
const Email = createModel(z.email().brand('Email'));

// Function can now require already validated data
function sendWelcomeEmail(to: Email) {
  // No need to validate - email is guaranteed to be valid
  console.log(`Sending welcome email to ${to}`);
}

// Usage requires validation
const email = Email.from('user@example.com');

sendWelcomeEmail(email);
