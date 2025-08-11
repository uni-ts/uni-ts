type Email = string & { __brand: 'email' };

function validateEmail(email: string) {
  if (!email.includes('@')) {
    throw new Error('Invalid email');
  }

  // Type casting is required to satisfy the type checker
  return email as Email;
}

function sendWelcomeEmail(to: Email) {}

// Email needs to be validated beforehand
const email = validateEmail(String(window.prompt('Enter your email')));

sendWelcomeEmail(email); // Now type checks pass
