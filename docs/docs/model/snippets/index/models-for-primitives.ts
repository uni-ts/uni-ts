function sendWelcomeEmail(to: string) {
  // What if the email is invalid?
  // What if an empty string is passed?
}

// Looks fine
sendWelcomeEmail('test@example.com');

// Oops!
sendWelcomeEmail('example.com');
sendWelcomeEmail('');
