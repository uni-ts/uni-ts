import { err, isErr, ok } from '@uni-ts/result';

function validateEmail(email: string) {
  if (email.length > 254) return err('too_long');
  if (!email.includes('@')) return err('invalid_format');

  return ok(email);
}

const result = validateEmail('not-an-email');

if (isErr(result)) {
  if (result.error === 'invalid_format') {
    console.log('Email must contain @ symbol');
  }

  if (result.error === 'too_long') {
    console.log('Email is too long');
  }
}
