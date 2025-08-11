import type { Contact } from './contact';

export function updateContact(data: Contact) {
  // Duplicated email validation logic
  if (!data.email.includes('@')) {
    throw new Error('Invalid email');
  }

  // Oops! In `createContact` we require at least 3 characters
  if (data.name.length < 1) {
    throw new Error('Name too short');
  }
  // ...
}
