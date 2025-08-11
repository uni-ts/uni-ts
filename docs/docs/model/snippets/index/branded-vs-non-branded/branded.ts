type Email = string & { __brand: 'email' };

function sendWelcomeEmail(to: Email) {}

const email = String(window.prompt('Enter your email'));

// Requires a branded type
sendWelcomeEmail(email);
