type Email = string;

function sendWelcomeEmail(to: Email) {}

const email = String(window.prompt('Enter your email'));

// Accepts any string
sendWelcomeEmail(email);
